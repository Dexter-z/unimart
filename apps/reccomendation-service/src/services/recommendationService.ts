import * as tf from "@tensorflow/tfjs-node"
import { getUserActivity } from "./fetch-user-activity"
import { preProcessData } from "../utils/preProcessData";

const EMBEDDING_DIM = 50; // Number of actions to use to train the model also change in recommendation controller

interface UserAction {
    userId: string;
    productId: string;
    actionType: "product_view" | "add_to_cart" | "purchase" | "add_to_wishlist";
}

interface Interactions {
    userId: string;
    productId: string;
    actionType: UserAction["actionType"];
}

interface RecommendedProducts {
    productId: string;
    score: number;
}

async function fetchUserActivity(userId: string): Promise<UserAction[]> {
    const userActions = await getUserActivity(userId);
    return Array.isArray(userActions) ? (userActions as unknown as UserAction[]) : [];
}

export const recommendProducts = async (userId: string, allProducts: any): Promise<string[]> => {

    const userActions: UserAction[] = await fetchUserActivity(userId);
    if (userActions.length === 0) {
        return [];
    }

    const processedData = preProcessData(userActions, allProducts);
    if (!processedData || !processedData.interactions || processedData.interactions.length === 0) {
        return [];
    }

    const { interactions } = processedData as {
        interactions: Interactions[];
    }

    const userMap: Record<string, number> = {};
    const productMap: Record<string, number> = {};

    let userCount = 0;
    let productCount = 0;

    interactions.forEach(({ userId, productId }) => {
        if (!(userId in userMap)) {
            userMap[userId] = userCount++;
        }
        if (!(productId in productMap)) {
            productMap[productId] = productCount++;
        }
    })

    const userInput = tf.input({
        shape: [1],
        dtype: 'int32',
    }) as tf.SymbolicTensor;
    const productInput = tf.input({
        shape: [1],
        dtype: 'int32',
    }) as tf.SymbolicTensor;

    const userEmbedding = tf.layers.embedding({
        inputDim: userCount,
        outputDim: EMBEDDING_DIM,
    }).apply(userInput) as tf.SymbolicTensor;

    const productEmbedding = tf.layers.embedding({
        inputDim: productCount,
        outputDim: EMBEDDING_DIM,
    }).apply(productInput) as tf.SymbolicTensor;

    const userVector = tf.layers.flatten().apply(userEmbedding) as tf.SymbolicTensor;
    const productVector = tf.layers.flatten().apply(productEmbedding) as tf.SymbolicTensor;

    const merged = tf.layers.dot({ axes: 1 }).apply([userVector, productVector]) as tf.SymbolicTensor;

    const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(merged) as tf.SymbolicTensor;

    const model = tf.model({
        inputs: [userInput, productInput],
        outputs: output,
    });

    model.compile({
        optimizer: tf.train.adam(),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
    });

    const userTensor = tf.tensor1d(interactions.map(i => userMap[i.userId] ?? 0), 'int32');
    const productTensor = tf.tensor1d(interactions.map(i => productMap[i.productId] ?? 0), 'int32');

    const weightLabels = tf.tensor2d(interactions.map(d => {
        switch (d.actionType) {
            case "purchase":
                return [1.0];
            case "add_to_cart":
                return [0.7];
            case "add_to_wishlist":
                return [0.5];
            case "product_view":
                return [0.1];
            default:
                return [0.0];
        }
    }), [interactions.length, 1]);

    await model.fit([userTensor, productTensor], weightLabels, {
        epochs: 5,
        batchSize: 32,
    });

    const productTensorAll = tf.tensor1d(Object.values(productMap), 'int32');

    const predictions = model.predict([tf.tensor1d([userMap[userId] ?? 0], 'int32'), productTensorAll]) as tf.Tensor;
    const scores = (await predictions.array()) as number[];

    const recommendProducts: RecommendedProducts[] = Object.keys(productMap)
        .map((productId, index) => ({
            productId,
            score: scores[index] ?? 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    return recommendProducts.map(item => item.productId);
}
