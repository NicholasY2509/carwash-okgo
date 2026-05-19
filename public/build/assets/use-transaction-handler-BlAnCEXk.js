import{S as s}from"./sweetalert2.esm.all-B_C3J2Yp.js";const f=({onSuccess:a,reset:t})=>({handleSuccess:(o,d)=>{const n=o.props.flash?.transaction;n?(a(),s.fire({icon:"success",title:"Proses Berhasil",html:`
                    <div>
                        <p>Transaksi untuk <strong>${n.customer.name}</strong> berhasil.</p>
                        <p>No. Referensi: <strong>${n.id}</strong></p>
                    </div>
                `,showConfirmButton:!0,confirmButtonText:"Tutup"}).then(r=>{if(r.isDismissed&&r.dismiss===s.DismissReason.cancel){let e=n.customer.phone||"";e.startsWith("0")&&(e="62"+e.substring(1));const i=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR"}).format(n.total_amount||0),c=n.serviceRecords?.[0]?.product?.name||"Cuci Mobil",l=`Halo ${n.customer.name},

Terima kasih telah menggunakan layanan kami!

*Detail Transaksi:*
No. Referensi: ${n.id}
Layanan: ${c}
Total: ${i}

Semoga harimu menyenangkan!`,m=`https://wa.me/${e}?text=${encodeURIComponent(l)}`;window.open(m,"_blank")}t()})):(s.fire({icon:"success",title:"Proses Berhasil",text:"Berhasil Mneyelesaikan Transaksi.",showConfirmButton:!0}),a(),t())},handleError:()=>{s.fire({icon:"error",title:"Gagal",text:"Terjadi kesalahan saat menyimpan data."})}});export{f as u};
