import React from 'react';
import { CheckCircle, Truck, PackageCheck, ClipboardList, HelpCircle } from 'lucide-react';

const STEPS = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STEP_ICONS = {
  Placed: ClipboardList,
  Confirmed: CheckCircle,
  Packed: PackageCheck,
  Shipped: Truck,
  'Out for Delivery': Truck,
  Delivered: CheckCircle
};

export default function VisualTimeline({ orderStatus, statusTimeline = [] }) {
  const getStepIndex = (status) => {
    return STEPS.indexOf(status);
  };

  const currentIdx = getStepIndex(orderStatus);

  if (orderStatus === 'Cancelled') {
    return (
      <div className="bg-red-950/20 border border-red-500/30 p-4 rounded text-center my-4 text-red-400">
        <h4 className="font-bold uppercase tracking-wider">This order has been Cancelled</h4>
        <p className="text-xs text-gray-400 mt-1">
          {statusTimeline.find(t => t.status === 'Cancelled')?.description || 'No reason provided.'}
        </p>
      </div>
    );
  }

  if (orderStatus === 'Returned') {
    return (
      <div className="bg-gold/10 border border-gold/30 p-5 rounded my-4 text-gold">
        <h4 className="font-bold uppercase tracking-widest text-center">Return & Refund Flow Active</h4>
        <div className="flex flex-col md:flex-row justify-around items-center mt-6 text-xs gap-4">
          <div className="flex flex-col items-center">
            <span className="h-6 w-6 rounded-full bg-gold text-teal-dark flex items-center justify-center font-bold">1</span>
            <span className="mt-2 font-semibold">Return Requested</span>
          </div>
          <div className="w-12 h-0.5 bg-gold" />
          <div className="flex flex-col items-center opacity-70">
            <span className="h-6 w-6 rounded-full border border-gold flex items-center justify-center font-bold">2</span>
            <span className="mt-2 font-semibold">Courier Picked Up</span>
          </div>
          <div className="w-12 h-0.5 bg-gold/30" />
          <div className="flex flex-col items-center opacity-50">
            <span className="h-6 w-6 rounded-full border border-gold/30 flex items-center justify-center font-bold">3</span>
            <span className="mt-2 font-semibold">Refund Credited</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 bg-teal-dark/20 border border-gold/10 rounded-lg p-6">
      <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold mb-6 text-center">
        Weaving Progress Timeline
      </h3>

      {/* Progress nodes */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6 md:gap-2">
        {STEPS.map((step, idx) => {
          const IconComponent = STEP_ICONS[step] || HelpCircle;
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          
          // Timestamp for matching state transition
          const matchedTimeline = statusTimeline.find(t => t.status === step);
          const timeStr = matchedTimeline 
            ? new Date(matchedTimeline.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : null;

          return (
            <div key={step} className="flex md:flex-col items-center flex-1 w-full relative z-10">
              
              {/* Connector line for desktop */}
              {idx < STEPS.length - 1 && (
                <div className={`hidden md:block absolute left-1/2 top-4 w-full h-[2px] -z-10 ${
                  idx < currentIdx ? 'bg-gold' : 'bg-gold/15'
                }`} />
              )}

              {/* Progress Node Circle */}
              <div className={`h-9.5 w-9.5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCompleted 
                  ? 'bg-gold border-gold text-teal-dark font-bold shadow-lg scale-110 shadow-gold/20' 
                  : 'bg-teal-dark border-gold/20 text-gray-500'
              } ${isCurrent ? 'ring-4 ring-gold/30 animate-pulse' : ''}`}>
                <IconComponent className="h-4.5 w-4.5" />
              </div>

              {/* Step Info */}
              <div className="ml-4 md:ml-0 md:text-center mt-0 md:mt-3 flex-grow md:flex-grow-0">
                <span className={`text-xs uppercase tracking-widest font-bold block ${
                  isCompleted ? 'text-white' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {timeStr ? (
                  <span className="text-[10px] text-gold font-medium block mt-0.5">{timeStr}</span>
                ) : (
                  <span className="text-[9px] text-gray-600 block mt-0.5">Pending</span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
