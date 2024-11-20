export default function RecipientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Recipients</h1>
        <button className="px-4 py-2 bg-primary-light dark:bg-primary text-white rounded-md hover:bg-primary dark:hover:bg-primary-dark transition-colors">
          Add Recipient
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-text-light dark:text-text-dark">Recipient management coming soon...</p>
      </div>
    </div>
  );
}
