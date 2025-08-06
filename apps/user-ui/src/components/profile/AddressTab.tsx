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
  Check
} from 'lucide-react'

const AddressTab = () => {
  const [showAddForm, setShowAddForm] = useState(false)

  // Mock addresses data
  const addresses = [
    {
      id: 1,
      type: 'home',
      label: 'Home',
      isDefault: true,
      fullName: 'John Doe',
      phone: '+234 123 456 7890',
      address: '123 Main Street, Apt 4B',
      city: 'Lagos',
      state: 'Lagos State',
      zipCode: '101001',
      country: 'Nigeria'
    },
    {
      id: 2,
      type: 'work',
      label: 'Office',
      isDefault: false,
      fullName: 'John Doe',
      phone: '+234 123 456 7890',
      address: '456 Business District, Floor 12',
      city: 'Lagos',
      state: 'Lagos State',
      zipCode: '101002',
      country: 'Nigeria'
    }
  ]

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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Shipping Addresses</h2>
          <p className="text-gray-400 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 lg:mt-0 px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Add New Address</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Street Address</label>
              <input
                type="text"
                className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">City</label>
                <input
                  type="text"
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State</label>
                <select className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff8800]">
                  <option value="">Select state</option>
                  <option value="lagos">Lagos State</option>
                  <option value="abuja">FCT Abuja</option>
                  <option value="kano">Kano State</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">ZIP Code</label>
                <input
                  type="text"
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Address Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="addressType" value="home" className="text-[#ff8800]" />
                  <span className="text-white">Home</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="addressType" value="work" className="text-[#ff8800]" />
                  <span className="text-white">Work</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="addressType" value="other" className="text-[#ff8800]" />
                  <span className="text-white">Other</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" className="text-[#ff8800]" />
              <label className="text-white text-sm">Set as default address</label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-[#232326] text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#ff8800]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getAddressIcon(address.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{address.label}</h3>
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
                      <span>{address.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{address.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-[#232326] rounded-xl hover:bg-[#ff8800] transition-colors">
                  <Edit className="w-4 h-4 text-gray-400 hover:text-[#18181b]" />
                </button>
                <button className="p-2 bg-[#232326] rounded-xl hover:bg-red-500 transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#232326]">
              <div className="text-sm text-gray-400">
                Last used: 2 days ago
              </div>
              {!address.isDefault && (
                <button className="px-4 py-2 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors text-sm">
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddressTab
