type PlaceholderPanelProps = {
  title: string;
  message: string;
};

export function PlaceholderPanel({ title, message }: PlaceholderPanelProps) {
  return (
    <section className="panel placeholder-panel">
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
