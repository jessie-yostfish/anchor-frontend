import { haptics } from '../lib/haptics'

interface Tab {
  id: string
  label: string
}

interface TabSwitcherProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function TabSwitcher({ tabs, activeTab, onChange }: TabSwitcherProps) {
  const handleTabChange = (tabId: string) => {
    haptics.light()
    onChange(tabId)
  }

  return (
    <div className="bg-gray-100 rounded-full p-1 inline-flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white shadow-sm text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
