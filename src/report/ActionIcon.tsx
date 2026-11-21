const paths = {
  back: 'M19 12H5m6-6-6 6 6 6',
  next: 'M5 12h14m-6-6 6 6-6 6',
  review: 'M9 5H6v16h13V5h-3M9 3h6v4H9zm0 11 2 2 4-5',
  details: 'M4 7h6m4 0h6M4 17h10m4 0h2M10 4v6m6 4v6',
  result: 'M4 19h16M6 16v-4m5 4V9m5 7v-5m0-7 1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
  preview: 'M14 4h6v6m0-6-10 10m0-9H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4',
  export: 'M12 3v12m-5-5 5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3',
  send: 'm21 3-7 18-4-8-8-4 19-6Zm0 0L10 13',
};

export default function ActionIcon({name}: {name: keyof typeof paths}) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}
