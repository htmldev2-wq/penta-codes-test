<x-mail::message>
# New website enquiry

**Name:** {{ $lead->name ?: '-' }}<br>
**Email:** {{ $lead->email ?: '-' }}<br>
**Phone:** {{ $lead->phone ?: '-' }}<br>
**Website:** {{ $lead->website ?: '-' }}

**Message:**<br>
{{ $lead->message ?: '-' }}

---

Form: {{ $lead->form_id ?: '-' }}<br>
Page: {{ $lead->source_page ?: '-' }}<br>
Submitted: {{ $lead->created_at }}
</x-mail::message>
