<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewLeadNotification;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Honeypot: real visitors never fill this hidden field in; bots often do.
        // Pretend success so bots don't learn anything, but don't save/email it.
        if (filled($request->input('company'))) {
            return response()->json(['ok' => true]);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:5000'],
            'formId' => ['nullable', 'string', 'max:100'],
            'sourcePage' => ['nullable', 'string', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'error' => 'Please enter a valid email address.',
            ], 422);
        }

        $data = $validator->validated();

        if (blank($data['name'] ?? null) && blank($data['email'] ?? null) && blank($data['phone'] ?? null)) {
            return response()->json([
                'ok' => false,
                'error' => 'Please provide at least a name, email, or phone number.',
            ], 422);
        }

        $lead = Lead::create([
            'form_id' => $data['formId'] ?? null,
            'source_page' => $data['sourcePage'] ?? null,
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'website' => $data['website'] ?? null,
            'message' => $data['message'] ?? null,
            'user_agent' => $request->userAgent(),
        ]);

        $emailSent = false;
        $toEmail = config('mail.lead_to_email');
        if ($toEmail) {
            try {
                Mail::to($toEmail)->send(new NewLeadNotification($lead));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::warning('[leads] failed to send notification email: '.$e->getMessage());
            }
        }

        return response()->json(['ok' => true, 'emailSent' => $emailSent]);
    }
}
