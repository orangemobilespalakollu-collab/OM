import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

export function MetricDetailsDialog({ title, dataList, children }) {
  if (!dataList) return children;

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={<div className="cursor-pointer h-full transition-transform active:scale-95" />}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title} Details</DialogTitle>
          <DialogDescription>List of records contributing to the {title.toLowerCase()} metric.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar pr-2">
          <div className="grid gap-3">
            {dataList.length > 0 ? dataList.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col flex-wrap sm:flex-row sm:items-center justify-between gap-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-orange-200/50 hover:bg-orange-50/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 lyt-display tracking-tight">{item.customer_name || item.product_name}</p>
                    {item.status && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                        item.status === 'Returned' ? 'bg-green-100 text-green-700' :
                        item.status === 'Not Repairable' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      )}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {item.device_brand ? `${item.device_brand} ${item.device_model}` : item.brand_type}
                    {item.customer_mobile ? ` • ${item.customer_mobile}` : ''}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                    {item.returned_at && item.status === 'Returned' 
                      ? `Returned: ${formatDateTime(item.returned_at)}`
                      : item.created_at 
                        ? `${item.status ? 'Registered' : 'Date'}: ${formatDateTime(item.created_at)}`
                        : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right flex flex-col sm:flex-col sm:items-end flex-wrap">
                  <p className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none">{item.ticket_number || `Qty: ${item.quantity}`}</p>
                  <div className="flex flex-col sm:items-end w-full mt-1.5">
                    {item.estimated_cost != null && item.final_amount != null && item.estimated_cost !== item.final_amount && (
                      <span className="text-[10px] font-bold text-slate-400 line-through">EST. {formatCurrency(item.estimated_cost)}</span>
                    )}
                    <span className="text-sm font-black text-slate-900 tabular-nums tracking-tight">
                      {item.price ? formatCurrency(item.price * item.quantity) : (item.final_amount != null ? formatCurrency(item.final_amount) : (item.estimated_cost ? `Est. ${formatCurrency(item.estimated_cost)}` : ''))}
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-slate-500 p-8 text-center italic">No records found for this metric.</p>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
          <DialogClose render={<Button variant="ghost" className="w-full sm:w-auto">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
