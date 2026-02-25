import { supabase } from './supabase'

type EventName =
  | 'screen_viewed'
  | 'preparation_started'
  | 'preparation_completed'
  | 'timeline_stage_completed'
  | 'court_date_added'
  | 'rights_viewed'
  | 'note_saved'
  | 'return_visit'

interface EventProps {
  screen?: string
  role?: string
  prep_type?: string
  metadata?: Record<string, string | number | boolean>
}

export async function trackEvent(event: EventName, props: EventProps = {}) {
  try {
    await supabase.from('analytics_events').insert({
      event_name: event,
      user_role: props.role || null,
      screen: props.screen || null,
      metadata: props.metadata || null,
    })
  } catch {
    // Fail silently — never block the user experience
  }
}
