<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewLeadNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New website enquiry — {$this->leadDisplayName()}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-lead',
        );
    }

    private function leadDisplayName(): string
    {
        return $this->lead->name ?: 'Unknown';
    }
}
