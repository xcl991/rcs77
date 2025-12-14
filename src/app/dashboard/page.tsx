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
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadSessions()
  }, [userId])

  const loadSessions = async () => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Sessions</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
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
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
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
                <Badge className={session.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
                  {session.status}
                </Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1">
                <p>Phone: {session.phone || 'N/A'}</p>
                <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignsContent({ userId }: { userId?: string }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadCampaigns()
  }, [userId])

  const loadCampaigns = async () => {
    try {
      const res = await fetch(`/api/campaigns?userId=${userId}`)
      const data = await res.json()
      if (data.success) setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
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
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadCampaigns}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
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
                <Badge className={getStatusClass(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1 mb-3">
                <p>Template: {campaign.template?.name || 'N/A'}</p>
                <p>Contacts: {campaign.totalContacts || 0}</p>
              </div>
              {/* Progress bar */}
              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${campaign.totalContacts > 0 ? (campaign.sentCount / campaign.totalContacts * 100) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#9ca3af] mb-4">
                <span className="text-[#10b981]">{campaign.sentCount || 0} sent</span>
                <span className="text-[#ef4444]">{campaign.failedCount || 0} failed</span>
                <span>{campaign.pendingCount || 0} pending</span>
              </div>
              <div className="flex gap-2">
                {campaign.status === 'DRAFT' && (
                  <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]">
                    <Play className="w-4 h-4 mr-1" /> Start
                  </Button>
                )}
                {campaign.status === 'RUNNING' && (
                  <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706]">
                    <Pause className="w-4 h-4 mr-1" /> Pause
                  </Button>
                )}
                {campaign.status === 'PAUSED' && (
                  <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]">
                    <Play className="w-4 h-4 mr-1" /> Resume
                  </Button>
                )}
                {(campaign.status === 'RUNNING' || campaign.status === 'PAUSED') && (
                  <Button size="sm" className="bg-[#ef4444] hover:bg-[#dc2626]">
                    <Square className="w-4 h-4 mr-1" /> Stop
                  </Button>
                )}
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TemplatesContent({ userId }: { userId?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadTemplates()
  }, [userId])

  const loadTemplates = async () => {
    try {
      const res = await fetch(`/api/templates?userId=${userId}`)
      const data = await res.json()
      if (data.success) setTemplates(data.templates || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Templates</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="bg-[#374151] border border-[#374151] rounded-lg px-4 py-2 text-[#f9fafb]">
          <option>All Categories</option>
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : templates.length === 0 ? (
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
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[#f9fafb]">{template.name}</h3>
                {template.category && (
                  <span className="badge-category">{template.category}</span>
                )}
              </div>
              <p className="text-sm text-[#9ca3af] mb-3 line-clamp-3">{template.content}</p>
              {template.mediaPath && (
                <p className="text-xs text-[#4f46e5] mb-3">Has media attachment</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactsContent({ userId }: { userId?: string }) {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadContacts()
  }, [userId])

  const loadContacts = async () => {
    try {
      const res = await fetch(`/api/contacts?userId=${userId}`)
      const data = await res.json()
      if (data.success) setContacts(data.contacts || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Contacts</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadContacts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="bg-[#374151] border border-[#374151] rounded-lg px-4 py-2 text-[#f9fafb]">
          <option>All Groups</option>
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 bg-[#374151] border border-[#374151] rounded-lg text-[#f9fafb] placeholder-[#9ca3af]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : contacts.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Contact className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No contacts found. Add or import contacts to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="p-0">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Groups</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="text-[#f9fafb]">{contact.name}</td>
                    <td className="text-[#9ca3af] font-mono">{contact.phone}</td>
                    <td>
                      {contact.groups?.map((g: any) => (
                        <span key={g.id} className="badge-group mr-1">{g.name}</span>
                      ))}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProxiesContent({ userId }: { userId?: string }) {
  const [proxies, setProxies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadProxies()
  }, [userId])

  const loadProxies = async () => {
    try {
      const res = await fetch(`/api/proxies?userId=${userId}`)
      const data = await res.json()
      if (data.success) setProxies(data.proxies || [])
    } catch (error) {
      console.error('Error loading proxies:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'LIVE': return 'live'
      case 'DEAD': return 'dead'
      default: return 'unchecked'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Proxies</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            Add Proxy
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]">
            <Plus className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-box">
          <span className="stat-number">{proxies.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-box">
          <span className="stat-number success">{proxies.filter(p => p.status === 'LIVE').length}</span>
          <span className="stat-label">Live</span>
        </div>
        <div className="stat-box">
          <span className="stat-number danger">{proxies.filter(p => p.status === 'DEAD').length}</span>
          <span className="stat-label">Dead</span>
        </div>
        <div className="stat-box">
          <span className="stat-number warning">{proxies.filter(p => p.status === 'UNCHECKED').length}</span>
          <span className="stat-label">Unchecked</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : proxies.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No proxies found. Add proxies to use with sessions.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="proxy-item">
              <div className={`proxy-status-indicator ${getStatusClass(proxy.status)}`}></div>
              <div className="flex-1">
                <p className="text-[#f9fafb] font-mono">{proxy.host}:{proxy.port}</p>
                <p className="text-xs text-[#9ca3af]">
                  {proxy.type} {proxy.username && '(Auth)'}
                  {proxy.latency && <span className="ml-2">{proxy.latency}ms</span>}
                </p>
              </div>
              <Badge className={`mr-4 ${proxy.status === 'LIVE' ? 'status-active' : proxy.status === 'DEAD' ? 'status-error' : 'status-inactive'}`}>
                {proxy.status}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FingerprintsContent({ userId }: { userId?: string }) {
  const [fingerprints, setFingerprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadFingerprints()
  }, [userId])

  const loadFingerprints = async () => {
    try {
      const res = await fetch(`/api/fingerprints?userId=${userId}`)
      const data = await res.json()
      if (data.success) setFingerprints(data.fingerprints || [])
    } catch (error) {
      console.error('Error loading fingerprints:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Fingerprints</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            New Fingerprint
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadFingerprints}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : fingerprints.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Fingerprint className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No fingerprints found. Generate fingerprints for browser sessions.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fingerprints.map((fp) => (
            <div key={fp.id} className="fingerprint-item">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-[#f9fafb]">{fp.name}</h3>
                <span className="text-xs text-[#9ca3af] font-mono">{fp.id.slice(0, 8)}...</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#9ca3af]">Browser:</span>
                  <span className="ml-2 text-[#f9fafb]">{fp.browser || 'Chrome'}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">OS:</span>
                  <span className="ml-2 text-[#f9fafb]">{fp.os || 'Windows'}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Resolution:</span>
                  <span className="ml-2 text-[#f9fafb]">{fp.screenResolution || '1920x1080'}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Language:</span>
                  <span className="ml-2 text-[#f9fafb]">{fp.language || 'en-US'}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Copy className="w-4 h-4 mr-1" /> Duplicate
                </Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkersContent({ userId }: { userId?: string }) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadWorkers()
  }, [userId])

  const loadWorkers = async () => {
    try {
      const res = await fetch(`/api/workers?userId=${userId}`)
      const data = await res.json()
      if (data.success) setWorkers(data.workers || [])
    } catch (error) {
      console.error('Error loading workers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#f9fafb]">Workers</h2>
        <div className="flex gap-2">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca]">
            <Plus className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
          <Button variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb] hover:bg-[#4b5563]" onClick={loadWorkers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-box">
          <span className="stat-number">{workers.length}</span>
          <span className="stat-label">Total Workers</span>
        </div>
        <div className="stat-box">
          <span className="stat-number success">{workers.filter(w => w.isOnline).length}</span>
          <span className="stat-label">Online</span>
        </div>
        <div className="stat-box">
          <span className="stat-number danger">{workers.filter(w => !w.isOnline).length}</span>
          <span className="stat-label">Offline</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : workers.length === 0 ? (
        <Card className="bg-[#1f2937] border-[#374151]">
          <CardContent className="py-12">
            <div className="empty-state">
              <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No workers registered. Set up a local worker to execute campaigns.</p>
              <div className="mt-4 text-left max-w-md mx-auto bg-[#374151] rounded-lg p-4">
                <p className="text-sm text-[#9ca3af] mb-2">Setup instructions:</p>
                <ol className="text-sm text-[#f9fafb] space-y-1 list-decimal list-inside">
                  <li>Go to the worker folder</li>
                  <li>Run <code className="bg-[#111827] px-1 rounded">npm run setup</code></li>
                  <li>Add the worker here with generated API key</li>
                  <li>Start worker with <code className="bg-[#111827] px-1 rounded">npm start</code></li>
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
                <Badge className={worker.isOnline ? 'status-online' : 'status-offline'}>
                  {worker.isOnline ? (
                    <><Wifi className="w-3 h-3 mr-1" /> Online</>
                  ) : (
                    <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                  )}
                </Badge>
              </div>
              <div className="text-sm text-[#9ca3af] space-y-1 mb-3">
                <p>API Key: <span className="font-mono">{worker.apiKey.slice(0, 12)}...</span></p>
                {worker.ipAddress && <p>IP: {worker.ipAddress}</p>}
                {worker.lastSeen && (
                  <p>Last seen: {new Date(worker.lastSeen).toLocaleString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Eye className="w-4 h-4 mr-1" /> Details
                </Button>
                <Button size="sm" variant="outline" className="bg-[#374151] border-[#374151] text-[#f9fafb]">
                  <Copy className="w-4 h-4 mr-1" /> Copy Key
                </Button>
                <Button size="sm" variant="outline" className="bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626]">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
