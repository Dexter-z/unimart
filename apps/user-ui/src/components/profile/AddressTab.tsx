import React, { useState } from 'react'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Phone,
  User,
  Check,
  X
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  landmark: string
  addressType: 'home' | 'work' | 'other'
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface AddressFormData {
  name: string
  phone: string
  address: string
  city: string
  state: string
  landmark: string
  addressType: 'home' | 'work' | 'other'
  isDefault: boolean
}

const AddressTab = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AddressFormData>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      addressType: 'home',
      isDefault: false
    }
  })

  // Fetch addresses
  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/shipping-addresses')
      return response.data
    }
  })

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await axiosInstance.post('/api/add-address', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowModal(false)
      reset()
    }
  })

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: AddressFormData }) => {
      const response = await axiosInstance.put(`/api/update-address/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowModal(false)
      setEditingAddress(null)
      reset()
    }
  })

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await axiosInstance.delete(`/api/delete-address/${addressId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setDeleteConfirm(null)
    }
  })

  const onSubmit = async (data: AddressFormData) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data })
    } else {
      addAddressMutation.mutate(data)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setValue('name', address.name)
    setValue('phone', address.phone)
    setValue('address', address.address)
    setValue('city', address.city)
    setValue('state', address.state)
    setValue('landmark', address.landmark)
    setValue('addressType', address.addressType)
    setValue('isDefault', address.isDefault)
    setShowModal(true)
  }

  const handleDelete = (addressId: string) => {
    deleteAddressMutation.mutate(addressId)
  }

  const resetForm = () => {
    reset()
    setEditingAddress(null)
    setShowModal(false)
  }

  const addresses: Address[] = addressesData?.addresses || []

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5 text-[#ff8800]" />
      case 'work':
        return <Building className="w-5 h-5 text-[#ff8800]" />
      default:
        return <MapPin className="w-5 h-5 text-[#ff8800]" />
    }
  }

  const getAddressLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home'
      case 'work':
        return 'Work'
      case 'other':
        return 'Other'
      default:
        return 'Address'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[130vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff8800] mx-auto"></div>
          <p className="text-white mt-4">Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[130vh]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Shipping Addresses</h2>
          <p className="text-gray-400 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 lg:mt-0 px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No addresses yet</h3>
            <p className="text-gray-400 mb-6">Add your first shipping address to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ff8800]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getAddressIcon(address.addressType)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{getAddressLabel(address.addressType)}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-[#ff8800] text-[#18181b] rounded-full text-xs font-medium flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Default</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-gray-400">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{address.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{address.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <div>
                          <p>{address.address}</p>
                          <p>{address.landmark}</p>
                          <p>{address.city}, {address.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="p-2 bg-[#232326] rounded-xl hover:bg-[#ff8800] transition-colors group"
                  >
                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#18181b]" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(address.id)}
                    className="p-2 bg-[#232326] rounded-xl hover:bg-red-500 transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#232326]">
                <div className="text-sm text-gray-400">
                  Added: {new Date(address.createdAt).toLocaleDateString()}
                </div>
                {!address.isDefault && (
                  <button 
                    onClick={() => updateAddressMutation.mutate({ 
                      id: address.id, 
                      data: { ...address, isDefault: true } 
                    })}
                    disabled={updateAddressMutation.isPending}
                    className="px-4 py-2 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors text-sm disabled:opacity-50"
                  >
                    {updateAddressMutation.isPending ? 'Setting...' : 'Set as Default'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 bg-[#232326] rounded-xl hover:bg-red-500 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Full Name *</label>
                    <input
                      type="text"
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                        errors.name ? 'border-red-500' : 'border-[#232326]'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[\d\s-()]{10,}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                        errors.phone ? 'border-red-500' : 'border-[#232326]'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Street Address *</label>
                  <input
                    type="text"
                    {...register('address', {
                      required: 'Street address is required',
                      minLength: { value: 5, message: 'Address must be at least 5 characters' }
                    })}
                    className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                      errors.address ? 'border-red-500' : 'border-[#232326]'
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">City *</label>
                    <input
                      type="text"
                      {...register('city', {
                        required: 'City is required',
                        minLength: { value: 2, message: 'City must be at least 2 characters' }
                      })}
                      className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                        errors.city ? 'border-red-500' : 'border-[#232326]'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">State *</label>
                    <input
                      type="text"
                      {...register('state', {
                        required: 'State is required',
                        minLength: { value: 2, message: 'State must be at least 2 characters' }
                      })}
                      className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                        errors.state ? 'border-red-500' : 'border-[#232326]'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Landmark *</label>
                  <input
                    type="text"
                    {...register('landmark', {
                      required: 'Landmark is required',
                      minLength: { value: 2, message: 'Landmark must be at least 2 characters' }
                    })}
                    className={`w-full bg-[#18181b] border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] ${
                      errors.landmark ? 'border-red-500' : 'border-[#232326]'
                    }`}
                    placeholder="Enter landmark"
                  />
                  {errors.landmark && (
                    <p className="text-red-500 text-sm mt-1">{errors.landmark.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Address Type *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value="home" 
                        {...register('addressType', { required: 'Please select an address type' })}
                        className="text-[#ff8800]" 
                      />
                      <span className="text-white">Home</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value="work" 
                        {...register('addressType')}
                        className="text-[#ff8800]" 
                      />
                      <span className="text-white">Work</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value="other" 
                        {...register('addressType')}
                        className="text-[#ff8800]" 
                      />
                      <span className="text-white">Other</span>
                    </label>
                  </div>
                  {errors.addressType && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressType.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    {...register('isDefault')}
                    className="text-[#ff8800]" 
                  />
                  <label className="text-white text-sm">Set as default address</label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || addAddressMutation.isPending || updateAddressMutation.isPending}
                    className="px-6 py-3 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting || addAddressMutation.isPending || updateAddressMutation.isPending 
                      ? 'Saving...' 
                      : editingAddress 
                        ? 'Update Address' 
                        : 'Save Address'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Address</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteAddressMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteAddressMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-[#232326] text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressTab
