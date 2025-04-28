'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id, Doc } from '@/convex/_generated/dataModel'
// import Link from 'next/link'
import ImagePreview from '@/components/ImagePreview'
import { Phone, ShoppingCart, Loader2, Plus, Minus, CheckCircle, Home, Briefcase, X } from 'lucide-react'
import '@/skeleton.css'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { PROMO_DISCOUNT } from '@/convex/constants'
// import Image from 'next/image'
// import { cn } from '@/lib/utils'

function ProductPage() {
  const params = useParams()
  const productId = params.id as Id<"products">
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const hasTrackedViewContent = useRef(false);
  
  const settings = useQuery(api.settings.getSettings);
  const tariffs = useQuery(api.tarif_livraison.getSortedTariffs);
  
  const product = useQuery(api.products.getProductById, {
    productId
  })

  // Determine the actual unit price (use promo_price if available)
  const unitPrice = product?.promo_price ?? product?.price ?? 0;

  const category = useQuery(api.products.getCategoryById, 
    !product?.category ? "skip" : { 
      categoryId: product.category 
    }
  )

  // Checkout form states
  const [quantity, setQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [canOrder, setCanOrder] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true)
  const [selectedWilaya, setSelectedWilaya] = useState<string>("")
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<"home" | "office" | "">("")
  const [deliveryPrice, setDeliveryPrice] = useState(0)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [exactAddress, setExactAddress] = useState("")
  const [orderRemarks, setOrderRemarks] = useState("")
  const [orderCreated, setOrderCreated] = useState(false)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [hasTrackedInitiateCheckout, setHasTrackedInitiateCheckout] = useState(false)

  const createOrder = useMutation(api.products.createOrder)

  useEffect(() => {
    if (!hasTrackedViewContent.current && typeof window !== "undefined" && typeof window.fbq === "function" && product) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [productId],
        content_type: 'product',
        value: product.promo_price ?? product.price,
        currency: 'DZD'
      });
      console.log("Facebook ViewContent event sent!");
      hasTrackedViewContent.current = true;
    }
  }, [product]);
  
  useEffect(() => {
    if (product) {
      const basePrice = unitPrice * quantity
      const totalWithDelivery = basePrice + deliveryPrice
      setTotalPrice(totalWithDelivery)
    }
  }, [product, unitPrice, quantity, deliveryPrice])

  useEffect(() => {
    const isFullNameValid = fullName.trim().length > 0
    const phoneNumberRegex = /^0\d{9}$/
    const isPhoneNumberValid = phoneNumberRegex.test(phoneNumber.trim())
    const isWilayaSelected = selectedWilaya !== ""
    const isDeliveryTypeSelected = selectedDeliveryType !== ""
    const isAddressValid = selectedDeliveryType === "office" || exactAddress.trim().length > 0
    
    setCanOrder(
      isFullNameValid &&
      isPhoneNumberValid &&
      isWilayaSelected &&
      isDeliveryTypeSelected &&
      isAddressValid
    )
  }, [fullName, phoneNumber, selectedWilaya, selectedDeliveryType, exactAddress])

  useEffect(() => {
    if (canOrder && typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "AddPaymentInfo")
      console.log("Facebook AddPaymentInfo event sent!")
    }
  }, [canOrder])

  useEffect(() => {
    if (!hasTrackedInitiateCheckout && (fullName.trim() || phoneNumber.trim()) && typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", {
        content_name: product?.name,
        content_ids: [productId],
        content_type: "product",
        value: product?.promo_price ?? product?.price,
        currency: "DZD"
      });
      console.log("Facebook InitiateCheckout event sent!");
      setHasTrackedInitiateCheckout(true);
    }
  }, [fullName, phoneNumber, hasTrackedInitiateCheckout, product, productId]);

  const handleWilayaChange = (value: string) => {
    setSelectedWilaya(value)
    setSelectedDeliveryType("")
    setDeliveryPrice(0)
    setDeliveryAddress("")
  }

  const handleDeliveryTypeChange = (value: "home" | "office") => {
    setSelectedDeliveryType(value)
    const wilayaData = tariffs?.find((w: Doc<"tarif_livraison">) => w.wilaya_code === selectedWilaya)
    if (wilayaData) {
      if (value === "home") {
        setDeliveryPrice(parseInt(wilayaData.price ?? "0"))
        setDeliveryAddress("")
        setExactAddress("")
      } else {
        setDeliveryPrice(parseInt(wilayaData.delivery_office_price ?? "0"))
        setDeliveryAddress(wilayaData.delivery_office_address ?? "")
        setExactAddress("")
      }
    }
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numbersOnly = value.replace(/[^\d]/g, '')
    setPhoneNumber(numbersOnly)
    const phoneNumberRegex = /^0\d{9}$/
    setIsPhoneNumberValid(phoneNumberRegex.test(numbersOnly) || numbersOnly === '')
  }

  const handleOrderCreation = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          value: totalPrice,
          currency: "DZD",
          content_name: product?.name,
          content_ids: [productId, product?.category],
          content_type: "product",
          num_items: quantity,
        })
        console.log("Facebook Purchase event sent!")
      } else {
        console.warn("Facebook Pixel is not loaded yet.")
      }

      await createOrder({
        productId,
        product_id: product?.product_id || "",
        quantity,
        fullName,
        phoneNumber: parseInt(phoneNumber),
        selectedWilaya: `${selectedWilaya} - ${tariffs?.find((w: Doc<"tarif_livraison">) => w.wilaya_code === selectedWilaya)?.wilaya_name}`,
        selectedDeliveryType,
        deliveryAddress,
        exactAddress,
        orderRemarks,
        totalPrice,
      })
      setOrderCreated(true)
      setIsLoadingOrder(true)
      setTimeout(() => setIsLoadingOrder(false), 5000)
    } catch (error) {
      console.error("Order creation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1)
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  if (!product || !category) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 8px solid #e0e0e0;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    )
  }

  return (
    <div className="min-h-screen mb-2 max-w-md mx-auto md:max-w-6xl md:px-8 lg:px-16 xl:px-32">
      {/* Breadcrumb */}
      {/* <div className="bg-white w-full py-1 px-4 md:px-0 rounded-xl">
        <div className="text-[15px] whitespace-nowrap overflow-x-auto scrollbar-hide flex items-center md:justify-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex-shrink-0">Accueil</Link>
          <span className="mx-2 text-gray-600 flex-shrink-0">{'>'}</span>
          <Link href={`/category/${category._id}`} className="text-gray-600 hover:text-gray-800 flex-shrink-0">{category.name_fr}</Link>
          <span className="mx-2 text-gray-600 flex-shrink-0">{'>'}</span>
          <span className="font-bold flex-shrink-0">{product.name}</span>
        </div>
      </div> */}

      {/* Desktop: Side-by-side layout */}
      <div className="md:flex md:gap-8 md:mt-8">
        {/* Image Gallery */}
        <div className="md:w-1/2">
          {/* Main Image (desktop) */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4 relative">
            <img
              src={product.images[selectedImageIndex]}
              alt={`Product image ${selectedImageIndex + 1}`}
              className="w-full h-[400px] object-contain rounded-xl transition-all duration-200"
              onClick={() => setIsPreviewOpen(true)}
              style={{ cursor: 'zoom-in' }}
            />
            {/* Thumbnails */}
            <div className="relative mt-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full pb-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`flex-none w-16 h-16 object-cover rounded-lg border-2 transition-all duration-150 cursor-pointer ${index === selectedImageIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Mobile gallery */}
          <div className="w-full p-2 bg-gray-300 md:hidden">
            <div className="w-full overflow-x-auto flex gap-2 snap-x snap-mandatory">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className="flex-none w-[90%] snap-center cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index)
                    setIsPreviewOpen(true)
                  }}
                >
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-auto object-contain rounded-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info Panel */}
        <div className="md:w-1/2 md:sticky md:top-8">
          <div className="bg-white px-4 py-4 shadow-lg rounded-lg border border-gray-200 md:p-8 md:mb-8">
            <h1 className="text-[17px] text-gray-800 font-semibold">{product.name}</h1>
            {product.promo_price ? (
              <div className="flex items-baseline gap-2 mt-2 mb-4">
                <span className="text-[23px] font-bold text-red-600">{product.promo_price} DA</span>
                <span className="text-sm text-gray-500 line-through">{product.price} DA</span>
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                  -{Math.round(((product.price - product.promo_price) / product.price) * 100)}%
                </span>
              </div>
            ) : (
              <p className="text-[23px] font-bold mt-2 mb-4 text-black">{product.price} DA</p>
            )}
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-700 font-medium">Quantité:</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuantityChange('decrease')} 
                  disabled={quantity <= 1}
                  className="h-8 w-8 bg-white"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuantityChange('increase')}
                  className="h-8 w-8 bg-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Personal Information Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fullName" className="text-xs font-medium text-gray-700">Nom complet</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="mt-1 h-9 text-sm"
                    placeholder="Entrez votre nom"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-xs font-medium text-gray-700">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    maxLength={10}
                    className={`mt-1 h-9 text-sm ${!isPhoneNumberValid && phoneNumber !== '' ? 'border-red-500' : ''}`}
                    placeholder="0XXXXXXXXX"
                  />
                </div>
              </div>
              {!isPhoneNumberValid && phoneNumber !== '' && (
                <p className="text-red-500 text-xs -mt-1">Le numéro doit contenir 10 chiffres et commencer par 0</p>
              )}

              <div>
                <Label className="text-xs font-medium text-gray-700">Wilaya</Label>
                <Select value={selectedWilaya} onValueChange={handleWilayaChange}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {tariffs?.map((wilaya: Doc<"tarif_livraison">) => (
                      <SelectItem key={wilaya._id} value={wilaya.wilaya_code ?? ""}>
                        {wilaya.wilaya_name} - {wilaya.wilaya_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWilaya && (
                <div>
                  <Label className="text-xs font-medium text-gray-700">Type de livraison</Label>
                  <RadioGroup 
                    value={selectedDeliveryType} 
                    onValueChange={handleDeliveryTypeChange} 
                    className="mt-1 space-y-1.5"
                  >
                    <div 
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-white transition-colors ${selectedDeliveryType === 'home' ? 'border-[#102161] bg-white shadow-sm' : 'border-gray-200'}`}
                      onClick={() => handleDeliveryTypeChange('home')}
                    >
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="flex-1 flex items-center gap-2">
                        <Home className="h-3.5 w-3.5 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium">Livraison à domicile</div>
                          <div className="text-xs text-gray-500">
                            {tariffs?.find((w: Doc<"tarif_livraison">) => w.wilaya_code === selectedWilaya)?.price ?? 0} DA
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-white transition-colors ${selectedDeliveryType === 'office' ? 'border-[#102161] bg-white shadow-sm' : 'border-gray-200'}`}
                      onClick={() => handleDeliveryTypeChange('office')}
                    >
                      <RadioGroupItem value="office" id="office" />
                      <Label htmlFor="office" className="flex-1 flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium">Livraison au bureau</div>
                          <div className="text-xs text-gray-500">
                            {tariffs?.find((w: Doc<"tarif_livraison">) => w.wilaya_code === selectedWilaya)?.delivery_office_price ?? 0} DA
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedDeliveryType && (
                <>
                  {selectedDeliveryType === 'office' ? (
                    <div className="bg-blue-50 p-2 rounded-md">
                      <p className="text-xs">
                        <span className="font-medium">Bureau:</span> {deliveryAddress}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="exactAddress" className="text-xs font-medium text-gray-700">Adresse exacte</Label>
                      <Input 
                        id="exactAddress" 
                        value={exactAddress} 
                        onChange={(e) => setExactAddress(e.target.value)} 
                        className="mt-1 h-9 text-sm"
                        placeholder="Entrez votre adresse"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="remarks" className="text-xs font-medium text-gray-700">Remarques (optionnel)</Label>
                    <textarea
                      id="remarks"
                      value={orderRemarks}
                      onChange={(e) => setOrderRemarks(e.target.value)}
                      className="mt-1 border rounded-md p-2 w-full h-16 resize-none text-sm"
                      placeholder="Instructions spéciales pour la livraison"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Price Summary */}
            <div className="mt-4 space-y-1.5 border-t pt-4">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Prix ({quantity} x {unitPrice} DA)</span>
                <span>{unitPrice * quantity} DA</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Frais de livraison</span>
                <span>{deliveryPrice} DA</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>{totalPrice} DA</span>
              </div>
            </div>

            {/* Buy and Call Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => window.location.href = `tel:+213${settings?.phone_number}`}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 hover:bg-gray-50"
              >
                <Phone className="h-4 w-4" /> Appeler
              </Button>
              <Button
                onClick={() => handleOrderCreation()}
                disabled={!canOrder || isLoading}
                size="sm"
                className="flex-1 bg-[#102161] text-white hover:bg-blue-700 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="animate-spin h-4 w-4" /> Chargement...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    Commander - اطلب
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white mt-2 p-3 rounded-[2px] md:rounded-xl md:shadow-lg md:border md:border-gray-200 md:mx-0 md:mt-8 md:p-8">
        <h2 className="text-[15px] md:text-xl font-medium mb-2 text-gray-700">Description</h2>
        {product.description ? (
          <div className="text-[14px] md:text-lg text-gray-600 whitespace-pre-wrap leading-relaxed">
            <div 
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="prose prose-sm md:prose-base max-w-none"
            />
          </div>
        ) : (
          <p className="text-[14px] md:text-base text-gray-500 italic">Aucune description disponible</p>
        )}
      </div>

      {product.description_images && product.description_images.length > 0 && (
        <div className="w-full bg-white mt-2 md:rounded-xl md:shadow-lg md:border md:border-gray-200">
          <div className="flex flex-col">
            {product.description_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Description image ${index + 1}`}
                className="w-full h-auto"
              />
            ))}
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <ImagePreview
          images={product.images}
          selectedIndex={selectedImageIndex}
          onClose={() => setIsPreviewOpen(false)}
          onImageSelect={setSelectedImageIndex}
        />
      )}

      {/* Confirmation Modal */}
      {orderCreated && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button 
              onClick={() => setOrderCreated(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            {isLoadingOrder ? (
              <div className="flex items-center justify-center h-32 sm:h-40">
                <div className="loader"></div>
                <style jsx>{`
                  .loader {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #102161;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    animation: spin 1s linear infinite;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Commande réussie!</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Nous vous contacterons bientôt</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                        <span>{quantity} unité{quantity > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{totalPrice} DA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b">
                    <span className="text-sm sm:text-base text-gray-600">Client</span>
                    <span className="font-medium text-sm sm:text-base text-gray-900">{fullName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b">
                    <span className="text-sm sm:text-base text-gray-600">Téléphone</span>
                    <span className="font-medium text-sm sm:text-base text-gray-900">{phoneNumber}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b">
                    <span className="text-sm sm:text-base text-gray-600">Livraison</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {selectedDeliveryType === "home" ? (
                        <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                      ) : (
                        <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                      )}
                      <span className="font-medium text-sm sm:text-base text-gray-900">
                        {selectedDeliveryType === "home" ? "À domicile" : "Au bureau"}
                      </span>
                    </div>
                  </div>

                  <div className="pb-2 sm:pb-3 border-b">
                    <span className="text-sm sm:text-base text-gray-600">Adresse</span>
                    <p className="mt-1 font-medium text-sm sm:text-base text-gray-900 break-words">
                      {selectedDeliveryType === "home" ? exactAddress : deliveryAddress}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">سوف نتصل بك قريبًا لتأكيد طلبك معك</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPage