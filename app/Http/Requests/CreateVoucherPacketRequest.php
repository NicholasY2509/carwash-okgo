<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateVoucherPacketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'incentive_amount' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'valid_period_months' => 'required|integer|min:1',
            'has_unlimited_issuance' => 'required|boolean',
            'voucher_type_id' => 'required|integer|exists:voucher_types,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama packet wajib diisi.',
            'price.required' => 'Harga wajib diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'incentive_amount.required' => 'Insentif wajib diisi.',
            'incentive_amount.numeric' => 'Insentif harus berupa angka.',
            'quantity.required' => 'Jumlah voucher wajib diisi.',
            'quantity.integer' => 'Jumlah voucher harus berupa angka bulat.',
            'valid_period_months.required' => 'Masa aktif wajib diisi.',
            'voucher_type_id.required' => 'Tipe voucher wajib dipilih.',
            'voucher_type_id.exists' => 'Tipe voucher yang dipilih tidak valid.',
        ];
    }
}
