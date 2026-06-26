import { useState } from 'react';
import { MessageCircle, Send, Clock, CheckCircle, Search, Users, FileText, Copy } from 'lucide-react';
import { db } from '../../lib/db';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const messageTemplates = [
  {
    id: 'intro',
    name: 'Introduction',
    message: `Hello {name},

Thank you for your interest in ANAYA SOLAR SOLUTIONS! We are committed to providing you with the best solar energy solutions tailored to your needs.

Our team will contact you shortly to discuss your requirements.

Best regards,
ANAYA SOLAR Team`,
  },
  {
    id: 'survey',
    name: 'Survey Schedule',
    message: `Hello {name},

This is to confirm that our technical survey has been scheduled. Our survey team will visit your location to assess the site and design the optimal solar system for your property.

Please ensure someone is available at the location during the visit.

Thank you for choosing ANAYA SOLAR SOLUTIONS.

Best regards,
ANAYA SOLAR Team`,
  },
  {
    id: 'quote',
    name: 'Quotation Follow-up',
    message: `Hello {name},

We hope you've had a chance to review our solar system quotation. We'd love to answer any questions you might have and help you make an informed decision.

Our solar solutions offer:
- High efficiency panels
- 25 years performance warranty
- Complete after-sales support
- Government subsidy assistance

Please let us know if you'd like to proceed or need any clarifications.

Best regards,
ANAYA SOLAR Team`,
  },
  {
    id: 'installation',
    name: 'Installation Update',
    message: `Hello {name},

Great news! Your solar installation is progressing well. Our team is working diligently to ensure everything is set up perfectly.

We will keep you updated on the completion timeline.

Thank you for your patience and trust in ANAYA SOLAR SOLUTIONS.

Best regards,
ANAYA SOLAR Team`,
  },
  {
    id: 'payment',
    name: 'Payment Reminder',
    message: `Hello {name},

This is a friendly reminder regarding the pending payment for your solar installation project.

If you've already made the payment, please share the transaction details with us. If you have any questions or need assistance with payment options, please don't hesitate to contact us.

Thank you for choosing ANAYA SOLAR SOLUTIONS.

Best regards,
ANAYA SOLAR Team`,
  },
  {
    id: 'handover',
    name: 'Handover Congratulations',
    message: `Hello {name},

Congratulations! Your solar system is now fully operational and has been successfully handed over.

We're confident you'll enjoy the benefits of clean, renewable energy for years to come. Don't forget to claim your government subsidy!

For any after-sales support, please reach out to us anytime.

Thank you for choosing ANAYA SOLAR SOLUTIONS.

Best regards,
ANAYA SOLAR Team`,
  },
];

export function WhatsApp() {
  const logs = db.getWhatsAppLogs();
  const leads = db.getLeads();
  const customers = db.getCustomers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(messageTemplates[0]);
  const [customMessage, setCustomMessage] = useState(messageTemplates[0].message);
  const [selectedEntity, setSelectedEntity] = useState<'lead' | 'customer'>('lead');
  const [selectedId, setSelectedId] = useState('');

  const filteredLogs = logs.filter((log) => {
    return log.phone.includes(searchQuery) || log.message.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const recipients = selectedEntity === 'lead' ? leads : customers;

  const handleSendMessage = () => {
    if (!selectedId) {
      alert('Please select a recipient');
      return;
    }

    const recipient = recipients.find((r) => r.id === selectedId);
    if (!recipient) return;

    const message = customMessage.replace(/{name}/g, recipient.name);
    const cleanPhone = recipient.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');

    db.createWhatsAppLog({
      entityType: selectedEntity,
      entityId: selectedId,
      phone: recipient.phone,
      message: message,
      template: selectedTemplate.id,
      status: 'sent',
    });

    alert('Message sent via WhatsApp!');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntityName = (entityType: string, entityId: string) => {
    if (entityType === 'lead') {
      return leads.find((l) => l.id === entityId)?.name || 'Unknown';
    }
    return customers.find((c) => c.id === entityId)?.name || 'Unknown';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">WhatsApp Integration</h1>
          <p className="text-slate-500">Send messages to leads and customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-4">Send Message</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Recipients"
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value as 'lead' | 'customer');
                  setSelectedId('');
                }}
                options={[
                  { value: 'lead', label: 'Leads' },
                  { value: 'customer', label: 'Customers' },
                ]}
              />
              <Select
                label="Select Recipient"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                options={[
                  { value: '', label: `Select ${selectedEntity}` },
                  ...recipients.map((r) => ({
                    value: r.id,
                    label: `${r.name} (${r.phone})`,
                  })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setCustomMessage(template.message);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedTemplate.id === template.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Message
              </label>
              <div className="relative">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Type your message here..."
                />
                <button
                  onClick={() => copyToClipboard(customMessage)}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Use {`{name}`} to personalize with recipient's name
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
                Send via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-4">Quick Stats</h2>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Messages Sent</p>
                  <p className="text-2xl font-bold text-emerald-800">{logs.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Leads</p>
                  <p className="text-2xl font-bold text-blue-800">{leads.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Customers</p>
                  <p className="text-2xl font-bold text-amber-800">{customers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-slate-800">Message History</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {getEntityName(log.entityType, log.entityId)}
                      </p>
                      <p className="text-sm text-slate-500">{log.phone}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{log.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.sentAt)}
                    </div>
                    <span className="capitalize">{log.template}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No messages sent yet</p>
            <p className="text-sm text-slate-400">Send your first message using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}
