import{S as a}from"./sweetalert2.esm.all-B_C3J2Yp.js";const g=({onSuccess:s,reset:o})=>({handleSuccess:(i,p)=>{const l=i.props.flash?.error;if(l){a.fire({icon:"error",title:"Gagal",text:l,showConfirmButton:!0});return}const e=i.props.flash?.transaction,c=i.props.flash?.midtrans;if(c){const r=c.actions?.find(t=>t.name==="generate-qr-code");if(r){s();let t;a.fire({title:"Scan QRIS",html:`
                        <div class="flex flex-col items-center justify-center gap-4">
                            <p class="text-sm text-gray-600">Scan QR Code di bawah ini untuk menyelesaikan pembayaran</p>
                            <img src="${r.url}" alt="QRIS" class="w-64 h-64 object-contain mx-auto border rounded-lg p-2" />
                            <p class="font-semibold text-lg mt-2">Total: Rp ${new Intl.NumberFormat("id-ID").format(e?.total_amount||0)}</p>
                        </div>
                    `,showConfirmButton:!0,confirmButtonText:"Tutup",allowOutsideClick:!1,didOpen:()=>{t=setInterval(()=>{fetch(`/api/transactions/${e.id}/status`).then(n=>n.json()).then(n=>{n.status==="completed"&&(clearInterval(t),a.close(),a.fire({icon:"success",title:"Pembayaran Berhasil!",text:"Pembayaran QRIS telah diterima.",timer:3e3}))}).catch(n=>{})},5e3)},willClose:()=>{t&&clearInterval(t)}}).then(()=>{o()});return}}e?(s(),a.fire({icon:"success",title:"Proses Berhasil",html:`
                    <div>
                        <p>Transaksi untuk <strong>${e.customer.name}</strong> berhasil.</p>
                    </div>
                `,showConfirmButton:!0,confirmButtonText:"Tutup"}).then(r=>{if(r.isDismissed&&r.dismiss===a.DismissReason.cancel){let t=e.customer.phone||"";t.startsWith("0")&&(t="62"+t.substring(1));const n=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR"}).format(e.total_amount||0),m=e.serviceRecords?.[0]?.product?.name||"Cuci Mobil",u=`Halo ${e.customer.name},

Terima kasih telah menggunakan layanan kami!

*Detail Transaksi:*
Layanan: ${m}
Total: ${n}

Semoga harimu menyenangkan!`,d=`https://wa.me/${t}?text=${encodeURIComponent(u)}`;window.open(d,"_blank")}o()})):(a.fire({icon:"success",title:"Proses Berhasil",text:"Berhasil Menyelesaikan Transaksi.",showConfirmButton:!0}),s(),o())},handleError:()=>{a.fire({icon:"error",title:"Gagal",text:"Terjadi kesalahan saat menyimpan data."})}});export{g as u};
