import React, { useState } from 'react';
import { ShieldCheck, Truck, ArrowLeftRight, FileText } from 'lucide-react';

export default function Policies() {
  const [activeTab, setActiveTab] = useState('returns');

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold font-bold">Vaarahi Assured</span>
        <h1 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-widest uppercase mt-2">
          POLICIES & GUIDELINES
        </h1>
        <div className="h-0.5 w-24 bg-gold mx-auto mt-4" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold/10 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center space-x-2 px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-gold text-gold bg-gold/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Return & Refund</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center space-x-2 px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'border-gold text-gold bg-gold/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Shipping Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center space-x-2 px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'terms'
              ? 'border-gold text-gold bg-gold/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Terms of Service</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-teal-dark/35 border border-gold/15 p-6 md:p-8 rounded-lg text-sm leading-relaxed text-gray-300">
        
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold text-gold flex items-center">
              <ArrowLeftRight className="h-5 w-5 mr-2" />
              <span>Return & Refund Protocol</span>
            </h3>
            <p>
              We want you to be completely delighted with your handloom saree purchase. If you detect any craft quality deviations or discrepancies, you may initiate a return within <strong className="text-white">7 calendar days</strong> of receiving delivery.
            </p>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-gold block">Eligible Criteria:</span>
              <ul className="space-y-2 list-disc list-inside pl-2">
                <li>Saree must remain unworn, unwashed, and in its original folds.</li>
                <li>The authentic handloom silk/gold certification tag must remain attached.</li>
                <li>Custom-stitched blouse items are NOT eligible for return since they are tailored to individual bust sizing.</li>
              </ul>
            </div>
            <p>
              Refunds are credited back directly through our Razorpay checkout gateway onto the original payment account (UPI, credit/debit card, netbanking) within <strong className="text-white">3-5 business days</strong> once quality inspection is completed at our Hyderabad sorting hub.
            </p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold text-gold flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              <span>Shipping & Delivery Schedule</span>
            </h3>
            <p>
              Vaarahi ships luxury weaves across India securely. Standard shipping is complimentary on all orders above <strong className="text-white">₹2,000</strong>. Orders below ₹2,000 attract a flat shipping surcharge of ₹150.
            </p>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-gold block">Estimated Delivery Windows:</span>
              <ul className="space-y-2 pl-2 border-l border-gold/20">
                <li><strong>Metro Cities:</strong> 3-5 Business Days.</li>
                <li><strong>Non-Metro Locations:</strong> 5-7 Business Days.</li>
                <li><strong>Custom Blouse Orders:</strong> Adds 3-4 days to standard delivery for custom embroidery and sizing looms.</li>
              </ul>
            </div>
            <p>
              Once your saree is dispatched, automated notifications containing courier identifiers (tracking links) will be sent to your registered profile email.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold text-gold flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <span>Terms of Service Agreements</span>
            </h3>
            <p>
              By accessing the Vaarahi catalog and checkout nodes, you consent to our terms of service. Handwoven fabrics possess slight variations in color hues, zari thread texture patterns, and weave densities. These irregularities are the hallmarks of pure handloom craftsmanship and are not classified as flaws.
            </p>
            <p>
              Unauthorized commercial resale of Vaarahi handlooms under alternative designer labels is prohibited. All lookbook visuals, copywriting descriptions, and brand assets are intellectual property of Vaarahi Saree Co.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
