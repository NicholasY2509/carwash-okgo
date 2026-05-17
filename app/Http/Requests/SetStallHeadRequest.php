<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SetStallHeadRequest extends FormRequest
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
            "driver_id" => "required",
            "qc_id" => "required"
        ];
    }

    public function messages(): array{
        return [
            "driver_id.required" => "Driver wajib diisi.",
            "qc_id.required" => "QC wajib diisi.",
        ];
    }
}
