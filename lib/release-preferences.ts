// Keep the subscriber and every requested variant in the same D1 batch.
export const saveSubscriberSql = `INSERT INTO release_list
  (id, email, colourway, preferred_size, consent_version, created_at, unsubscribe_token)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET
    colourway = CASE WHEN excluded.colourway = 'undecided' THEN release_list.colourway ELSE excluded.colourway END,
    preferred_size = CASE WHEN excluded.preferred_size = 'undecided' THEN release_list.preferred_size ELSE excluded.preferred_size END,
    consent_version = excluded.consent_version`;

export const saveAvailabilitySql = `INSERT INTO availability_requests
  (id, email, colourway, preferred_size, created_at) VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(email, colourway, preferred_size) DO NOTHING`;

export const releasePreferencesSql = `SELECT r.email,
  COALESCE(a.colourway, r.colourway) AS colourway,
  COALESCE(a.preferred_size, r.preferred_size) AS preferred_size,
  COALESCE(a.created_at, r.created_at) AS created_at,
  r.consent_version, r.unsubscribe_token
  FROM release_list r LEFT JOIN availability_requests a ON a.email = r.email
  ORDER BY COALESCE(a.created_at, r.created_at) DESC`;
