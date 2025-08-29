import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { getUnseenCount } from "@packages/libs/redis/message.redis";
import { NextFunction, Response } from "express";


//Create new conversation
export const newConversation = async(req:any, res:Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body;
        const userId = req.user.id;
        
        if(!sellerId){
            return next(new ValidationError("Seller ID is required"));
        }

        const existingGroup = await prisma.conversationGroup.findFirst({
            where: {
                isGroup: false,
                participantIds: {
                    hasEvery: [userId, sellerId]
                }
            }
        })

        if(existingGroup){
            return res.status(200).json({conversation: existingGroup, isNew: false});
        }

        //Create new conversation
        const newGroup = await prisma.conversationGroup.create({
            data: {
                isGroup: false,
                creatorId: userId,
                participantIds: [userId, sellerId]
            }
        })

        await prisma.participant.createMany({
            data: [
                { conversationId: newGroup.id, userId},
                { conversationId: newGroup.id, userId: sellerId }
            ]
        })

        return res.status(201).json({conversation: newGroup, isNew: true});
    } catch (error) {
        next(error)
    }
}

export const getUserConversations = async(req:any, res:Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: userId
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })

        const responseData = await Promise.all(
            conversations.map(async (group) => {
                const sellerParticipant = await prisma.participant.findFirst({
                    where: { conversationId: group.id, sellerId: { not: null } }
                })

                let seller = null
                if(sellerParticipant?.sellerId) {
                    seller = await prisma.sellers.findUnique({
                        where: {
                            id: sellerParticipant.sellerId
                        },
                        include: {
                            shop: true
                        }
                    })
                }

                //Get last message in convo
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: group.id
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })

                //Check online status from redis
                let isOnline = false;
                if(sellerParticipant?.sellerId) {
                    const redisKey = `online:seller:${sellerParticipant.sellerId}`;
                    const redisResult = await redis.get(redisKey);
                    isOnline = !!redisResult
                }

                const unreadCount = await getUnseenCount("user", group.id);

                return {
                    conversationId: group.id,
                    seller: {
                        id: seller?.id || null,
                        name: seller?.shop?.name || "Unknown Seller",
                        isOnline,
                        avatar: seller?.shop?.avatar || null
                    },
                    lastMessage: lastMessage?.content || "Send a message to start a conversation",
                    lastMessageAt: lastMessage?.createdAt || group.updatedAt,
                    unreadCount,
                }
            })
        )

        return res.status(200).json({conversations: responseData});
    } catch (error) {
        return next(error)
    }
}

//Get seller conversations
export const getSellerConversations = async(req:any, res:Response, next: NextFunction) => {
    try {
        const sellerId = req.seller.id;

        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: sellerId
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })

        const responseData = await Promise.all(
            conversations.map(async (group) => {
                const userParticipant = await prisma.participant.findFirst({
                    where: { conversationId: group.id, userId: { not: null } }
                })

                //Get user details
                let user = null
                if(userParticipant?.userId) {
                    user = await prisma.users.findUnique({
                        where: {
                            id: userParticipant.userId
                        },
                    })
                }

                //Get last message in convo
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: group.id
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })

                //Check online status from redis
                let isOnline = false;
                if(userParticipant?.userId) {
                    const redisKey = `online:user:user_${userParticipant.userId}`;
                    const redisResult = await redis.get(redisKey);
                    isOnline = !!redisResult
                }

                const unreadCount = await getUnseenCount("seller", group.id);

                return {
                    conversationId: group.id,
                    user: {
                        id: user?.id || null,
                        name: user?.name || "Unknown User",
                        isOnline,
                    },
                    lastMessage: lastMessage?.content || "Send a message to start a conversation",
                    lastMessageAt: lastMessage?.createdAt || group.updatedAt,
                    unreadCount,
                }
            })
        )

        return res.status(200).json({conversations: responseData});
    } catch (error) {
        return next(error)
    }
}