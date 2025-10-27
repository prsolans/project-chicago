/**
 * Admin Panel - Database Migration and Seeding UI
 * Accessible via /admin route or keyboard shortcut (Ctrl+Shift+A)
 */

import { useState } from 'react';
import { X, Database, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';
import { seedStaticPhrases } from '../../scripts/seedPhrases';
import { usePhraseLibrary } from '../../store/phraseLibraryStore';

interface AdminPanelProps {
  onClose: () => void;
}

type Step = 'idle' | 'running' | 'success' | 'error';

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [connectionStatus, setConnectionStatus] = useState<Step>('idle');
  const [migrationStatus, setMigrationStatus] = useState<Step>('idle');
  const [seedStatus, setSeedStatus] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);
  const [seedCount, setSeedCount] = useState<number>(0);

  const { refreshPhrases } = usePhraseLibrary();

  /**
   * Step 1: Check Supabase Connection
   */
  const handleCheckConnection = async () => {
    setConnectionStatus('running');
    setError(null);

    try {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setError('Cannot connect to Supabase. Check your credentials in .env file.');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  /**
   * Step 2: Run Database Migration
   */
  const handleRunMigration = async () => {
    setMigrationStatus('running');
    setError(null);

    try {
      // Read migration SQL file content
      const migrationSQL = await fetch('/supabase/migrations/001_initial_schema.sql').then(r => r.text());

      // Execute migration using Supabase SDK
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

      if (error) {
        // If exec_sql doesn't exist, we need to run it manually via SQL Editor
        // Let's try creating tables directly
        await runMigrationManually();
      }

      setMigrationStatus('success');
    } catch (err) {
      setMigrationStatus('error');
      setError(err instanceof Error ? err.message : 'Migration failed');
    }
  };

  /**
   * Run migration by executing SQL statements one by one
   */
  const runMigrationManually = async () => {
    // For now, show instructions for manual migration
    setMigrationStatus('error');
    setError('Automatic migration not available. Please run migration manually via Supabase Dashboard SQL Editor.');
  };

  /**
   * Step 3: Seed Database
   */
  const handleSeedDatabase = async () => {
    setSeedStatus('running');
    setError(null);

    try {
      const result = await seedStaticPhrases();

      if (result.success) {
        setSeedStatus('success');
        setSeedCount(result.count);
        // Refresh phrase library
        await refreshPhrases();
      } else {
        setSeedStatus('error');
        setError(result.error || 'Seeding failed');
      }
    } catch (err) {
      setSeedStatus('error');
      setError(err instanceof Error ? err.message : 'Seeding failed');
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: Step) => {
    switch (status) {
      case 'running':
        return <Loader className="w-5 h-5 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  /**
   * Get button state
   */
  const getButtonClass = (status: Step, disabled: boolean) => {
    const base = 'px-6 py-3 rounded-lg font-semibold text-white transition-all';

    if (disabled) {
      return `${base} bg-slate-600 cursor-not-allowed`;
    }

    if (status === 'running') {
      return `${base} bg-blue-600`;
    }

    if (status === 'success') {
      return `${base} bg-green-600 hover:bg-green-500`;
    }

    if (status === 'error') {
      return `${base} bg-red-600 hover:bg-red-500`;
    }

    return `${base} bg-blue-600 hover:bg-blue-500`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Database Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Global Error */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Connection */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">1. Check Connection</span>
              {getStatusIcon(connectionStatus)}
            </div>
            <p className="text-slate-400 text-sm">
              Verify connection to Supabase database
            </p>
            <button
              onClick={handleCheckConnection}
              disabled={connectionStatus === 'running'}
              className={getButtonClass(connectionStatus, connectionStatus === 'running')}
            >
              {connectionStatus === 'running' ? 'Checking...' : 'Check Connection'}
            </button>
          </div>

          {/* Step 2: Migration */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">2. Run Migration</span>
              {getStatusIcon(migrationStatus)}
            </div>
            <p className="text-slate-400 text-sm">
              Create database tables and views (run this once)
            </p>
            <button
              onClick={handleRunMigration}
              disabled={connectionStatus !== 'success' || migrationStatus === 'running'}
              className={getButtonClass(
                migrationStatus,
                connectionStatus !== 'success' || migrationStatus === 'running'
              )}
            >
              {migrationStatus === 'running' ? 'Running Migration...' : 'Run Migration'}
            </button>

            {/* Manual Migration Instructions */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300 mb-2 font-semibold">Manual Migration (Recommended):</p>
              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://supabase.com/dashboard/project/jbxwyixeyxxydqxleaqg/sql" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase SQL Editor</a></li>
                <li>Copy contents from <code className="text-slate-300">supabase/migrations/001_initial_schema.sql</code></li>
                <li>Paste and click "Run"</li>
              </ol>
            </div>
          </div>

          {/* Step 3: Seed */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">3. Seed Database</span>
              {getStatusIcon(seedStatus)}
            </div>
            <p className="text-slate-400 text-sm">
              Populate database with 200+ static phrases
            </p>
            <button
              onClick={handleSeedDatabase}
              disabled={seedStatus === 'running'}
              className={getButtonClass(seedStatus, seedStatus === 'running')}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>{seedStatus === 'running' ? 'Seeding...' : 'Seed Database'}</span>
              </div>
            </button>
            {seedStatus === 'success' && (
              <p className="text-green-400 text-sm">
                ✓ Successfully seeded {seedCount} phrases
              </p>
            )}
          </div>

          {/* Success State */}
          {connectionStatus === 'success' && seedStatus === 'success' && (
            <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Setup Complete!</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Your database is ready. Close this panel and start using the app.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
