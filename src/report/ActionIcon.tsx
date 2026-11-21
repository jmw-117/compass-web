const paths = {
  back: 'M19 12H5m6-6-6 6 6 6',
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
