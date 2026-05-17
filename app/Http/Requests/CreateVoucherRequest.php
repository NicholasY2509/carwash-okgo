<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateVoucherRequest extends FormRequest
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
            'serial_number'   => 'required|array',
            'serial_number.*' => 'required|string|unique:vouchers,serial_number',
            'voucher_type_id' => 'required|integer|exists:voucher_types,id',
            'expired_at'      => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'serial_number.required' => 'Daftar kode tidak boleh kosong.',
            'serial_number.*.unique' => 'Salah satu kode voucher sudah terdaftar.',
            'voucher_type_id.required' => 'Kategori voucher wajib dipilih.',
            'voucher_type_id.exists' => 'Kategori voucher tidak valid.',
        ];
    }
}
