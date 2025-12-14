'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Send,
  FileText,
  Contact,
  Shield,
  Fingerprint,
  Server,
  Settings,
  LogOut,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Search,
  Play,
  Pause,
  Square,
  Eye,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
}

interface Worker {
  id: string
  name: string
  apiKey: string
  status: string
  lastSeen: string | null
  ipAddress: string | null
  isOnline?: boolean
}

const menuItems = [
  { id: 'sessions', label: 'Sessions', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'contacts', label: 'Contacts', icon: Contact },
  { id: 'proxies', label: 'Proxies', icon: Shield },
  { id: 'fingerprints', label: 'Fingerprints', icon: Fingerprint },
  { id: 'workers', label: 'Workers', icon: Server },
  { id: 'admin', label: 'Admin', icon: Settings, adminOnly: true },
]

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState('sessions')
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const filteredMenuItems = menuItems.filter(item =>
    !item.adminOnly || user?.role === 'ADMIN'
  )

  const renderContent = () => {
    switch (activeMenu) {
      case 'sessions':
        return <SessionsContent userId={user?.id} />
      case 'campaigns':
        return <CampaignsContent userId={user?.id} />
      case 'templates':
        return <TemplatesContent userId={user?.id} />
      case 'contacts':
        return <ContactsContent userId={user?.id} />
      case 'proxies':
        return <ProxiesContent userId={user?.id} />
      case 'fingerprints':
        return <FingerprintsContent userId={user?.id} />
      case 'workers':
        return <WorkersContent userId={user?.id} />
      case 'admin':
        return <AdminContent />
      default:
        return <SessionsContent userId={user?.id} />
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111827]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#111827]">
      {/* Sidebar */}
      <div className="w-56 bg-[#1f2937] border-r border-[#374151] flex flex-col">
        <div className="p-4 border-b border-[#374151]">
          <h1 className="text-lg font-bold text-[#4f46e5]">RCS Blaster</h1>
          <p className="text-xs text-[#9ca3af]">v1.0.0</p>
        </div>

        <nav className="flex-1 p-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-left transition-colors ${
                  activeMenu === item.id
                    ? 'bg-[#4f46e5] text-white'
                    : 'text-[#9ca3af] hover:bg-[#374151] hover:text-[#f9fafb]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#374151]">
          <div className="text-sm text-[#9ca3af] mb-3">
            Logged in as <span className="text-[#f9fafb]">{user.username}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
    </div>
  )
}

function SessionsContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '' })

  useEffect(() => {
    if (userId) loadSessions()
  }, [userId])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions?userId=${userId}`)
      const data = await res.json()
      if (data.success) setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Session name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Session created successfully' })
        setShowCreateModal(false)
        setFormData({ name: '', phone: '' })
        loadSessions()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create session', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create session', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedSession) return
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSession.id, ...formData })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Session updated successfully' })
        setShowEditModal(false)
        loadSessions()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update session', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update session', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (session: any) => {
    if (!confirm(`Are you sure you want to delete session "${session.name}"?`)) return
    try {
      const res = await fetch(`/api/sessions?id=${session.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Session deleted successfully' })
        loadSessions()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to delete session', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete session', variant: 'destructive' })
    }
  }

  const openEdit = (session: any) => {
    setSelectedSession(session)
    setFormData({ name: session.name, phone: session.phone || '' })
    setShowEditModal(true)
  }

  const openView = (session: any) => {
    setSelectedSession(session)
    setShowViewModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Sessions</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => { setFormData({ name: '', phone: '' }); setShowCreateModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadSessions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : sessions.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No sessions found. Create a new session to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-[#f9fafb]">{session.name}</h3>
                <Badge className={session.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>{session.status}</Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1">
                <p>Phone: {session.phone || 'N/A'}</p>
                <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => openView(session)}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => openEdit(session)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(session)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Create New Session</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Session Name *</label>
              <input type="text" placeholder="Enter session name" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Phone Number</label>
              <input type="text" placeholder="Enter phone number (optional)" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Edit Session</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Session Name *</label>
              <input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Phone Number</label>
              <input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Session Details</DialogTitle></DialogHeader>
          {selectedSession && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Name:</span><span>{selectedSession.name}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Status:</span><Badge className={selectedSession.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>{selectedSession.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Phone:</span><span>{selectedSession.phone || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Created:</span><span>{new Date(selectedSession.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Last Activity:</span><span>{selectedSession.lastActivity ? new Date(selectedSession.lastActivity).toLocaleString() : 'N/A'}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CampaignsContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [contactGroups, setContactGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', templateId: '', contactGroupIds: [] as string[], sessionIds: [] as string[], delayBetweenMessages: 3000 })

  useEffect(() => {
    if (userId) { loadCampaigns(); loadDependencies() }
  }, [userId])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns?userId=${userId}`)
      const data = await res.json()
      if (data.success) setCampaigns(data.campaigns || [])
    } catch (error) { console.error('Error loading campaigns:', error) }
    finally { setLoading(false) }
  }

  const loadDependencies = async () => {
    try {
      const [tRes, sRes, gRes] = await Promise.all([
        fetch(`/api/templates?userId=${userId}`),
        fetch(`/api/sessions?userId=${userId}`),
        fetch(`/api/contacts/groups?userId=${userId}`)
      ])
      const [tData, sData, gData] = await Promise.all([tRes.json(), sRes.json(), gRes.json()])
      if (tData.success) setTemplates(tData.templates || [])
      if (sData.success) setSessions(sData.sessions || [])
      if (gData.success) setContactGroups(gData.groups || [])
    } catch (error) { console.error('Error loading dependencies:', error) }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.templateId) {
      toast({ title: 'Error', description: 'Name and template are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Campaign created successfully' })
        setShowCreateModal(false)
        setFormData({ name: '', description: '', templateId: '', contactGroupIds: [], sessionIds: [], delayBetweenMessages: 3000 })
        loadCampaigns()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create campaign', variant: 'destructive' })
      }
    } catch (error) { toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleAction = async (campaignId: string, action: string) => {
    try {
      const res = await fetch('/api/campaigns/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Campaign ${action} successfully` })
        loadCampaigns()
      } else {
        toast({ title: 'Error', description: data.error || `Failed to ${action} campaign`, variant: 'destructive' })
      }
    } catch (error) { toast({ title: 'Error', description: `Failed to ${action} campaign`, variant: 'destructive' }) }
  }

  const handleDelete = async (campaign: any) => {
    if (!confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) return
    try {
      const res = await fetch(`/api/campaigns?id=${campaign.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Campaign deleted successfully' })
        loadCampaigns()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' }) }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'status-running'
      case 'PAUSED': return 'status-paused'
      case 'COMPLETED': return 'status-completed'
      case 'FAILED': return 'status-failed'
      default: return 'status-draft'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Campaigns</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />New Campaign
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadCampaigns}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No campaigns found. Create a new campaign to start sending messages.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-[#f9fafb]">{campaign.name}</h3>
                <Badge className={getStatusClass(campaign.status)}>{campaign.status}</Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1 mb-3">
                <p>Template: {campaign.template?.name || 'N/A'}</p>
                <p>Contacts: {campaign.stats?.total || 0}</p>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${campaign.stats?.total > 0 ? ((campaign.stats?.sent || 0) / campaign.stats.total * 100) : 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[#9ca3af] mb-4">
                <span className="text-[#10b981]">{campaign.stats?.sent || 0} sent</span>
                <span className="text-[#ef4444]">{campaign.stats?.failed || 0} failed</span>
                <span>{campaign.stats?.pending || 0} pending</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {campaign.status === 'DRAFT' && (
                  <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]" onClick={() => handleAction(campaign.id, 'start')}><Play className="w-4 h-4 mr-1" /> Start</Button>
                )}
                {campaign.status === 'RUNNING' && (
                  <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706]" onClick={() => handleAction(campaign.id, 'pause')}><Pause className="w-4 h-4 mr-1" /> Pause</Button>
                )}
                {campaign.status === 'PAUSED' && (
                  <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]" onClick={() => handleAction(campaign.id, 'resume')}><Play className="w-4 h-4 mr-1" /> Resume</Button>
                )}
                {(campaign.status === 'RUNNING' || campaign.status === 'PAUSED') && (
                  <Button size="sm" className="bg-[#ef4444] hover:bg-[#dc2626]" onClick={() => handleAction(campaign.id, 'stop')}><Square className="w-4 h-4 mr-1" /> Stop</Button>
                )}
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => { setSelectedCampaign(campaign); setShowViewModal(true) }}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(campaign)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb] max-w-lg">
          <DialogHeader><DialogTitle>Create New Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Campaign Name *</label>
              <input type="text" placeholder="Enter campaign name" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Description</label>
              <textarea placeholder="Campaign description" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Template *</label>
              <select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.templateId} onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}>
                <option value="">Select template</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Contact Groups</label>
              <select multiple className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5] h-24" value={formData.contactGroupIds} onChange={(e) => setFormData({ ...formData, contactGroupIds: Array.from(e.target.selectedOptions, o => o.value) })}>
                {contactGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Sessions</label>
              <select multiple className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5] h-24" value={formData.sessionIds} onChange={(e) => setFormData({ ...formData, sessionIds: Array.from(e.target.selectedOptions, o => o.value) })}>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Delay Between Messages (ms)</label>
              <input type="number" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.delayBetweenMessages} onChange={(e) => setFormData({ ...formData, delayBetweenMessages: parseInt(e.target.value) || 3000 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Campaign Details</DialogTitle></DialogHeader>
          {selectedCampaign && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Name:</span><span>{selectedCampaign.name}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Status:</span><Badge className={getStatusClass(selectedCampaign.status)}>{selectedCampaign.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Template:</span><span>{selectedCampaign.template?.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Total:</span><span>{selectedCampaign.stats?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Sent:</span><span className="text-[#10b981]">{selectedCampaign.stats?.sent || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Failed:</span><span className="text-[#ef4444]">{selectedCampaign.stats?.failed || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Pending:</span><span>{selectedCampaign.stats?.pending || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Created:</span><span>{new Date(selectedCampaign.createdAt).toLocaleString()}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TemplatesContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', content: '', category: 'general', description: '' })

  useEffect(() => { if (userId) loadTemplates() }, [userId])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/templates?userId=${userId}`)
      const data = await res.json()
      if (data.success) setTemplates(data.templates || [])
    } catch (error) { console.error('Error loading templates:', error) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.content) {
      toast({ title: 'Error', description: 'Name and content are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Template created successfully' })
        setShowCreateModal(false)
        setFormData({ name: '', content: '', category: 'general', description: '' })
        loadTemplates()
      } else { toast({ title: 'Error', description: data.error || 'Failed to create template', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!selectedTemplate) return
    setSaving(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTemplate.id, ...formData })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Template updated successfully' })
        setShowEditModal(false)
        loadTemplates()
      } else { toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (template: any) => {
    if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) return
    try {
      const res = await fetch(`/api/templates?id=${template.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Template deleted successfully' })
        loadTemplates()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' }) }
  }

  const handleDuplicate = async (template: any) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${template.name} (Copy)`, content: template.content, category: template.category, description: template.description, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Template duplicated successfully' })
        loadTemplates()
      }
    } catch (error) { toast({ title: 'Error', description: 'Failed to duplicate', variant: 'destructive' }) }
  }

  const openEdit = (template: any) => {
    setSelectedTemplate(template)
    setFormData({ name: template.name, content: template.content, category: template.category || 'general', description: template.description || '' })
    setShowEditModal(true)
  }

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Templates</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => { setFormData({ name: '', content: '', category: 'general', description: '' }); setShowCreateModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />New Template
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
          <input type="text" placeholder="Search templates..." className="w-full pl-10 pr-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No templates found. Create a new template to use in campaigns.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[#f9fafb]">{template.name}</h3>
                {template.category && <span className="badge-category">{template.category}</span>}
              </div>
              <p className="text-sm text-[#9ca3af] mb-3 line-clamp-3">{template.content}</p>
              {template.mediaUrl && <p className="text-xs text-[#4f46e5] mb-3">Has media attachment</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => { setSelectedTemplate(template); setShowViewModal(true) }}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => openEdit(template)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => handleDuplicate(template)}><Copy className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(template)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Create New Template</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Template Name *</label><input type="text" placeholder="Enter template name" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Category</label><input type="text" placeholder="e.g., general, promo, welcome" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Content *</label><textarea placeholder="Enter message content. Use {{name}} for contact name, {{phone}} for phone." className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Template Name *</label><input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Category</label><input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Content *</label><textarea className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Template Preview</DialogTitle></DialogHeader>
          {selectedTemplate && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Name:</span><span>{selectedTemplate.name}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Category:</span><span>{selectedTemplate.category || 'general'}</span></div>
              <div><span className="text-[#9ca3af] block mb-2">Content:</span><div className="bg-[#374151] p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedTemplate.content}</div></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowViewModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ContactsContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', groupId: '' })
  const [importData, setImportData] = useState('')

  useEffect(() => { if (userId) { loadContacts(); loadGroups() } }, [userId])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts?userId=${userId}`)
      const data = await res.json()
      if (data.success) setContacts(data.contacts || [])
    } catch (error) { console.error('Error loading contacts:', error) }
    finally { setLoading(false) }
  }

  const loadGroups = async () => {
    try {
      const res = await fetch(`/api/contacts/groups?userId=${userId}`)
      const data = await res.json()
      if (data.success) setGroups(data.groups || [])
    } catch (error) { console.error('Error loading groups:', error) }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.phone) {
      toast({ title: 'Error', description: 'Name and phone are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Contact added successfully' })
        setShowCreateModal(false)
        setFormData({ name: '', phone: '', groupId: '' })
        loadContacts()
      } else { toast({ title: 'Error', description: data.error || 'Failed to add contact', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to add contact', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!selectedContact) return
    setSaving(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedContact.id, ...formData })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Contact updated successfully' })
        setShowEditModal(false)
        loadContacts()
      } else { toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to update contact', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (contact: any) => {
    if (!confirm(`Are you sure you want to delete "${contact.name}"?`)) return
    try {
      const res = await fetch(`/api/contacts?id=${contact.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Contact deleted successfully' })
        loadContacts()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete contact', variant: 'destructive' }) }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({ title: 'Error', description: 'Please enter contacts data', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const lines = importData.trim().split('\n')
      const contactsToImport = lines.map(line => {
        const parts = line.split(',').map(p => p.trim())
        return { name: parts[0] || 'Unknown', phone: parts[1] || parts[0] }
      }).filter(c => c.phone)

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: contactsToImport, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Imported ${data.count || contactsToImport.length} contacts` })
        setShowImportModal(false)
        setImportData('')
        loadContacts()
      } else { toast({ title: 'Error', description: data.error || 'Failed to import', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to import contacts', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleExport = () => {
    const csv = contacts.map(c => `${c.name},${c.phone}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
    toast({ title: 'Success', description: 'Contacts exported' })
  }

  const openEdit = (contact: any) => {
    setSelectedContact(contact)
    setFormData({ name: contact.name, phone: contact.phone, groupId: contact.groupId || '' })
    setShowEditModal(true)
  }

  const filteredContacts = contacts.filter(c =>
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)) &&
    (!selectedGroup || c.groupId === selectedGroup)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Contacts ({contacts.length})</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => { setFormData({ name: '', phone: '', groupId: '' }); setShowCreateModal(true) }}><Plus className="w-4 h-4 mr-2" />Add Contact</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={() => setShowImportModal(true)}><Upload className="w-4 h-4 mr-2" />Import</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadContacts}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="bg-[#374151] border border-[#374151] rounded-lg px-4 py-2 text-[#f9fafb]" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">All Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
          <input type="text" placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : filteredContacts.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]"><CardContent className="py-12"><div className="empty-state"><Contact className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>No contacts found. Add or import contacts to get started.</p></div></CardContent></Card>
      ) : (
        <Card className="bg-[#1f2937] border-[#374151]"><CardContent className="p-0">
          <table className="contacts-table"><thead><tr><th>Name</th><th>Phone</th><th>Group</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="text-[#f9fafb]">{contact.name}</td>
                  <td className="text-[#9ca3af] font-mono">{contact.phone}</td>
                  <td>{contact.group?.name && <span className="badge-group">{contact.group.name}</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => openEdit(contact)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(contact)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Name *</label><input type="text" placeholder="Enter name" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Phone *</label><input type="text" placeholder="Enter phone number" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Group</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}><option value="">No Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Adding...' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Name *</label><input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Phone *</label><input type="text" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Group</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}><option value="">No Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Import Contacts</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Paste contacts (CSV format: name,phone)</label><textarea placeholder="John Doe,+1234567890&#10;Jane Doe,+0987654321" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5] font-mono text-sm" rows={8} value={importData} onChange={(e) => setImportData(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleImport} disabled={saving}>{saving ? 'Importing...' : 'Import'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProxiesContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [proxies, setProxies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [formData, setFormData] = useState({ host: '', port: '', username: '', password: '', type: 'HTTP' })
  const [bulkData, setBulkData] = useState('')

  useEffect(() => { if (userId) loadProxies() }, [userId])

  const loadProxies = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/proxies?userId=${userId}`)
      const data = await res.json()
      if (data.success) setProxies(data.proxies || [])
    } catch (error) { console.error('Error loading proxies:', error) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.host || !formData.port) {
      toast({ title: 'Error', description: 'Host and port are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/proxies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, port: parseInt(formData.port), userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Proxy added successfully' })
        setShowCreateModal(false)
        setFormData({ host: '', port: '', username: '', password: '', type: 'HTTP' })
        loadProxies()
      } else { toast({ title: 'Error', description: data.error || 'Failed to add proxy', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to add proxy', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleBulkAdd = async () => {
    if (!bulkData.trim()) {
      toast({ title: 'Error', description: 'Please enter proxy data', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const lines = bulkData.trim().split('\n')
      const proxiesToAdd = lines.map(line => {
        const parts = line.split(':').map(p => p.trim())
        return { host: parts[0], port: parseInt(parts[1]) || 80, username: parts[2] || '', password: parts[3] || '', type: 'HTTP' }
      }).filter(p => p.host && p.port)

      const res = await fetch('/api/proxies/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxies: proxiesToAdd, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Added ${data.count || proxiesToAdd.length} proxies` })
        setShowBulkModal(false)
        setBulkData('')
        loadProxies()
      } else { toast({ title: 'Error', description: data.error || 'Failed to add proxies', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to add proxies', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleCheckProxy = async (proxyId: string) => {
    try {
      const res = await fetch('/api/proxies/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxyId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Proxy is ${data.status}` })
        loadProxies()
      } else { toast({ title: 'Error', description: 'Failed to check proxy', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to check proxy', variant: 'destructive' }) }
  }

  const handleCheckAll = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/proxies/check-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Checked ${data.total} proxies: ${data.live} live, ${data.dead} dead` })
        loadProxies()
      } else { toast({ title: 'Error', description: data.error || 'Failed to check proxies', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to check proxies', variant: 'destructive' }) }
    finally { setChecking(false) }
  }

  const handleDelete = async (proxy: any) => {
    if (!confirm(`Delete proxy ${proxy.host}:${proxy.port}?`)) return
    try {
      const res = await fetch(`/api/proxies?id=${proxy.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Proxy deleted' })
        loadProxies()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete proxy', variant: 'destructive' }) }
  }

  const getStatusClass = (status: string) => {
    switch (status) { case 'LIVE': return 'live'; case 'DEAD': return 'dead'; default: return 'unchecked' }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Proxies</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Add Proxy</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={() => setShowBulkModal(true)}><Plus className="w-4 h-4 mr-2" />Bulk Add</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={handleCheckAll} disabled={checking}><RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />{checking ? 'Checking...' : 'Check All'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-box"><span className="stat-number">{proxies.length}</span><span className="stat-label">Total</span></div>
        <div className="stat-box"><span className="stat-number success">{proxies.filter(p => p.status === 'LIVE').length}</span><span className="stat-label">Live</span></div>
        <div className="stat-box"><span className="stat-number danger">{proxies.filter(p => p.status === 'DEAD').length}</span><span className="stat-label">Dead</span></div>
        <div className="stat-box"><span className="stat-number warning">{proxies.filter(p => !p.status || p.status === 'UNCHECKED').length}</span><span className="stat-label">Unchecked</span></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : proxies.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]"><CardContent className="py-12"><div className="empty-state"><Shield className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>No proxies found. Add proxies to use with sessions.</p></div></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="proxy-item">
              <div className={`proxy-status-indicator ${getStatusClass(proxy.status)}`}></div>
              <div className="flex-1">
                <p className="text-[#f9fafb] font-mono">{proxy.host}:{proxy.port}</p>
                <p className="text-xs text-[#9ca3af]">
                  {proxy.protocol || proxy.type || 'HTTP'}
                  {proxy.username && ' (Auth)'}
                  {proxy.responseTime && <span className="ml-2 text-green-400">{proxy.responseTime}ms</span>}
                  {(proxy.country || proxy.city) && <span className="ml-2">📍 {[proxy.city, proxy.country].filter(Boolean).join(', ')}</span>}
                </p>
              </div>
              <Badge className={`mr-4 ${proxy.status === 'LIVE' ? 'status-active' : proxy.status === 'DEAD' ? 'status-error' : proxy.status === 'CHECKING' ? 'status-warning' : 'status-inactive'}`}>{proxy.status || 'UNCHECKED'}</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => handleCheckProxy(proxy.id)}><RefreshCw className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(proxy)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Add Proxy</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Host *</label><input type="text" placeholder="192.168.1.1" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} /></div>
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Port *</label><input type="text" placeholder="8080" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.port} onChange={(e) => setFormData({ ...formData, port: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Username</label><input type="text" placeholder="Optional" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Password</label><input type="password" placeholder="Optional" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
            </div>
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Type</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option>HTTP</option><option>HTTPS</option><option>SOCKS4</option><option>SOCKS5</option></select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Adding...' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Bulk Add Proxies</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Format: host:port or host:port:user:pass</label><textarea placeholder="192.168.1.1:8080&#10;10.0.0.1:3128:user:pass" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5] font-mono text-sm" rows={8} value={bulkData} onChange={(e) => setBulkData(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowBulkModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleBulkAdd} disabled={saving}>{saving ? 'Adding...' : 'Add All'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FingerprintsContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [fingerprints, setFingerprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedFp, setSelectedFp] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', browser: 'Chrome', os: 'Windows', screenResolution: '1920x1080', language: 'en-US' })

  useEffect(() => { if (userId) loadFingerprints() }, [userId])

  const loadFingerprints = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fingerprints?userId=${userId}`)
      const data = await res.json()
      if (data.success) setFingerprints(data.fingerprints || [])
    } catch (error) { console.error('Error loading fingerprints:', error) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/fingerprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Fingerprint created successfully' })
        setShowCreateModal(false)
        setFormData({ name: '', browser: 'Chrome', os: 'Windows', screenResolution: '1920x1080', language: 'en-US' })
        loadFingerprints()
      } else { toast({ title: 'Error', description: data.error || 'Failed to create', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to create fingerprint', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDuplicate = async (fp: any) => {
    try {
      const res = await fetch('/api/fingerprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${fp.name} (Copy)`, browser: fp.browser, os: fp.os, screenResolution: fp.screenResolution, language: fp.language, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Fingerprint duplicated' })
        loadFingerprints()
      }
    } catch (error) { toast({ title: 'Error', description: 'Failed to duplicate', variant: 'destructive' }) }
  }

  const handleDelete = async (fp: any) => {
    if (!confirm(`Delete fingerprint "${fp.name}"?`)) return
    try {
      const res = await fetch(`/api/fingerprints?id=${fp.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Fingerprint deleted' })
        loadFingerprints()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete fingerprint', variant: 'destructive' }) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Fingerprints ({fingerprints.length})</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />New Fingerprint</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadFingerprints}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : fingerprints.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]"><CardContent className="py-12"><div className="empty-state"><Fingerprint className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>No fingerprints found. Generate fingerprints for browser sessions.</p></div></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {fingerprints.map((fp) => (
            <div key={fp.id} className="fingerprint-item">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-[#f9fafb]">{fp.name}</h3>
                <span className="text-xs text-[#9ca3af] font-mono">{fp.id.slice(0, 8)}...</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-[#9ca3af]">Browser:</span><span className="ml-2 text-[#f9fafb]">{fp.browser || 'Chrome'}</span></div>
                <div><span className="text-[#9ca3af]">OS:</span><span className="ml-2 text-[#f9fafb]">{fp.os || 'Windows'}</span></div>
                <div><span className="text-[#9ca3af]">Resolution:</span><span className="ml-2 text-[#f9fafb]">{fp.screenResolution || '1920x1080'}</span></div>
                <div><span className="text-[#9ca3af]">Language:</span><span className="ml-2 text-[#f9fafb]">{fp.language || 'en-US'}</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => { setSelectedFp(fp); setShowViewModal(true) }}><Eye className="w-4 h-4 mr-1" />View</Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => handleDuplicate(fp)}><Copy className="w-4 h-4 mr-1" />Duplicate</Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(fp)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Create Fingerprint</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Name *</label><input type="text" placeholder="My Fingerprint" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Browser</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.browser} onChange={(e) => setFormData({ ...formData, browser: e.target.value })}><option>Chrome</option><option>Firefox</option><option>Safari</option><option>Edge</option></select></div>
              <div><label className="text-sm text-[#9ca3af] mb-1 block">OS</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.os} onChange={(e) => setFormData({ ...formData, os: e.target.value })}><option>Windows</option><option>macOS</option><option>Linux</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Resolution</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.screenResolution} onChange={(e) => setFormData({ ...formData, screenResolution: e.target.value })}><option>1920x1080</option><option>1366x768</option><option>1440x900</option><option>2560x1440</option></select></div>
              <div><label className="text-sm text-[#9ca3af] mb-1 block">Language</label><select className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}><option>en-US</option><option>en-GB</option><option>id-ID</option><option>ja-JP</option></select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Fingerprint Details</DialogTitle></DialogHeader>
          {selectedFp && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Name:</span><span>{selectedFp.name}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">ID:</span><span className="font-mono text-sm">{selectedFp.id}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Browser:</span><span>{selectedFp.browser}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">OS:</span><span>{selectedFp.os}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Resolution:</span><span>{selectedFp.screenResolution}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Language:</span><span>{selectedFp.language}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">User Agent:</span><span className="text-xs">{selectedFp.userAgent || 'Default'}</span></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowViewModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkersContent({ userId }: { userId?: string }) {
  const { toast } = useToast()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '' })

  useEffect(() => { if (userId) loadWorkers() }, [userId])

  const loadWorkers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workers?userId=${userId}`)
      const data = await res.json()
      if (data.success) setWorkers(data.workers || [])
    } catch (error) { console.error('Error loading workers:', error) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Worker name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, userId })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: `Worker created! API Key: ${data.worker.apiKey}` })
        setShowCreateModal(false)
        setFormData({ name: '' })
        loadWorkers()
      } else { toast({ title: 'Error', description: data.error || 'Failed to create', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to create worker', variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleCopyKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast({ title: 'Copied', description: 'API key copied to clipboard' })
  }

  const handleDelete = async (worker: Worker) => {
    if (!confirm(`Delete worker "${worker.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/workers?id=${worker.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Worker deleted' })
        loadWorkers()
      } else { toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' }) }
    } catch (error) { toast({ title: 'Error', description: 'Failed to delete worker', variant: 'destructive' }) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Workers</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Add Worker</Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadWorkers}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-box"><span className="stat-number">{workers.length}</span><span className="stat-label">Total Workers</span></div>
        <div className="stat-box"><span className="stat-number success">{workers.filter(w => w.isOnline).length}</span><span className="stat-label">Online</span></div>
        <div className="stat-box"><span className="stat-number danger">{workers.filter(w => !w.isOnline).length}</span><span className="stat-label">Offline</span></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner"></div></div>
      ) : workers.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No workers registered. Set up a local worker to execute campaigns.</p>
              <div className="mt-4 text-left max-w-md mx-auto bg-[#374151] rounded-lg p-4">
                <p className="text-sm text-[#9ca3af] mb-2">Setup instructions:</p>
                <ol className="text-sm text-[#f9fafb] space-y-1 list-decimal list-inside">
                  <li>Add a worker here to get an API key</li>
                  <li>Go to the worker folder</li>
                  <li>Create .env with MONGODB_URI and WORKER_API_KEY</li>
                  <li>Run <code className="bg-[#111827] px-1 rounded">npm start</code></li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`worker-status-dot ${worker.isOnline ? 'online' : 'offline'}`}></div>
                  <h3 className="font-semibold text-[#f9fafb]">{worker.name}</h3>
                </div>
                <Badge className={worker.isOnline ? 'status-online' : 'status-offline'}>{worker.isOnline ? <><Wifi className="w-3 h-3 mr-1" />Online</> : <><WifiOff className="w-3 h-3 mr-1" />Offline</>}</Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1 mb-3">
                <p>API Key: <span className="font-mono">{worker.apiKey.slice(0, 12)}...</span></p>
                {worker.ipAddress && <p>IP: {worker.ipAddress}</p>}
                {worker.lastSeen && <p>Last seen: {new Date(worker.lastSeen).toLocaleString()}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => { setSelectedWorker(worker); setShowViewModal(true) }}><Eye className="w-4 h-4 mr-1" />Details</Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => handleCopyKey(worker.apiKey)}><Copy className="w-4 h-4 mr-1" />Copy Key</Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]" onClick={() => handleDelete(worker)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Add Worker</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-[#9ca3af] mb-1 block">Worker Name *</label><input type="text" placeholder="My Local Worker" className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} /></div>
            <p className="text-sm text-[#9ca3af]">After creating, you will receive an API key. Use this key in your worker's .env file.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca]" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader><DialogTitle>Worker Details</DialogTitle></DialogHeader>
          {selectedWorker && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Name:</span><span>{selectedWorker.name}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Status:</span><Badge className={selectedWorker.isOnline ? 'status-online' : 'status-offline'}>{selectedWorker.isOnline ? 'Online' : 'Offline'}</Badge></div>
              <div><span className="text-[#9ca3af] block mb-1">API Key:</span><div className="bg-[#374151] p-2 rounded font-mono text-xs break-all">{selectedWorker.apiKey}</div></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">IP Address:</span><span>{selectedWorker.ipAddress || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Last Seen:</span><span>{selectedWorker.lastSeen ? new Date(selectedWorker.lastSeen).toLocaleString() : 'Never'}</span></div>
              <Button className="w-full mt-2 bg-[#4f46e5] hover:bg-[#4338ca]" onClick={() => handleCopyKey(selectedWorker.apiKey)}><Copy className="w-4 h-4 mr-2" />Copy API Key</Button>
            </div>
          )}
          <DialogFooter><Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]" onClick={() => setShowViewModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AdminUser {
  id: string
  username: string
  name: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

function AdminContent() {
  const { toast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<AdminUser[]>([])
  const [offlineUsers, setOfflineUsers] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'USER'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const [onlineRes, offlineRes, allRes] = await Promise.all([
        fetch('/api/admin?action=online-users'),
        fetch('/api/admin?action=offline-users'),
        fetch('/api/admin?action=users')
      ])

      const onlineData = await onlineRes.json()
      const offlineData = await offlineRes.json()
      const allData = await allRes.json()

      if (onlineData.success) setOnlineUsers(onlineData.users || [])
      if (offlineData.success) setOfflineUsers(offlineData.users || [])
      if (allData.success) setAllUsers(allData.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: 'Error',
        description: 'Username and password are required',
        variant: 'destructive'
      })
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-user',
          username: formData.username,
          password: formData.password,
          name: formData.name || formData.username,
          role: formData.role
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: `User "${formData.username}" created successfully`
        })
        setShowCreateModal(false)
        setFormData({ username: '', password: '', name: '', role: 'USER' })
        loadUsers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return

    try {
      const res = await fetch(`/api/admin?action=delete-user&userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.message) {
        toast({
          title: 'Success',
          description: `User "${username}" deleted successfully`
        })
        loadUsers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      })
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-user-status',
          userId,
          isActive: !currentStatus
        })
      })

      const data = await res.json()

      if (data.user) {
        toast({
          title: 'Success',
          description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        })
        loadUsers()
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const renderUserCard = (user: AdminUser, showDelete = true) => (
    <div key={user.id} className="flex items-center justify-between p-3 bg-[#374151] rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${onlineUsers.some(u => u.id === user.id) ? 'bg-green-500' : 'bg-gray-500'}`} />
        <div>
          <p className="text-[#f9fafb] font-medium">{user.name || user.username}</p>
          <p className="text-xs text-[#9ca3af]">@{user.username} - {user.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={user.isActive ? 'bg-green-600' : 'bg-red-600'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          className="bg-[#4b5563] border-[#4b5563] text-[#f9fafb] h-8"
          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
        >
          {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
        </Button>
        {showDelete && (
          <Button
            size="sm"
            variant="outline"
            className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626] h-8"
            onClick={() => handleDeleteUser(user.id, user.username)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Admin Panel</h2>
        <div className="flex gap-2">
          <Button
            className="bg-[#4f46e5] hover:bg-[#4338ca]"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          <Button
            variant="outline"
            className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]"
            onClick={loadUsers}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-box">
          <span className="stat-number">{allUsers.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-box">
          <span className="stat-number success">{onlineUsers.length}</span>
          <span className="stat-label">Online</span>
        </div>
        <div className="stat-box">
          <span className="stat-number danger">{offlineUsers.length}</span>
          <span className="stat-label">Offline</span>
        </div>
        <div className="stat-box">
          <span className="stat-number warning">{allUsers.filter(u => !u.isActive).length}</span>
          <span className="stat-label">Inactive</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1f2937] border-[#374151]">
            <CardHeader>
              <CardTitle className="text-[#f9fafb] flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-500" />
                Online Users ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onlineUsers.length === 0 ? (
                <p className="text-[#9ca3af]">No users online.</p>
              ) : (
                onlineUsers.map(user => renderUserCard(user))
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1f2937] border-[#374151]">
            <CardHeader>
              <CardTitle className="text-[#f9fafb] flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-gray-500" />
                Offline Users ({offlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offlineUsers.length === 0 ? (
                <p className="text-[#9ca3af]">No users offline.</p>
              ) : (
                offlineUsers.map(user => renderUserCard(user))
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1f2937] border-[#374151] md:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#f9fafb] flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users ({allUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allUsers.length === 0 ? (
                <p className="text-[#9ca3af]">No users found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allUsers.map(user => renderUserCard(user))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1f2937] border-[#374151] text-[#f9fafb]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Username *</label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Password *</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Display Name</label>
              <input
                type="text"
                placeholder="Enter display name (optional)"
                className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:border-[#4f46e5]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] mb-1 block">Role</label>
              <select
                className="w-full px-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#4f46e5]"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#4f46e5] hover:bg-[#4338ca]"
              onClick={handleCreateUser}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
