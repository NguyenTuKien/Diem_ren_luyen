export default function StudentPlaceholderPanel({ title, description }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white dark:bg-slate-800/50 p-8 text-center">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
