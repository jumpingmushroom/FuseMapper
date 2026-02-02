import { useState } from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { exportApi } from '@/api';
import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import type { ImportResult } from '@fusemapper/shared';

export function SettingsPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportApi.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fusemapper-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await exportApi.import(data);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        panelsImported: 0,
        fusesImported: 0,
        socketsImported: 0,
        devicesImported: 0,
        roomsImported: 0,
        errors: [error instanceof Error ? error.message : 'Import failed'],
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your FuseMapper data</p>
      </div>

      {/* Export/Import */}
      <Card>
        <CardHeader title="Data Management" subtitle="Export or import your panel data" />
        <CardBody className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-500 mb-3">
                Download all your panels, fuses, devices, and rooms as a JSON file.
              </p>
              <Button size="sm" onClick={handleExport} loading={exporting}>
                <FileJson size={16} />
                Export JSON
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Import Data</h4>
              <p className="text-sm text-gray-500 mb-3">
                Import data from a previously exported JSON file. This will add to your
                existing data.
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing}
                />
                <span className={`btn btn-sm bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FileJson size={16} />
                  Import JSON
                </span>
              </label>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg ${
                importResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {importResult.success ? (
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              )}
              <div>
                <h4
                  className={`font-medium ${
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </h4>
                <div className="text-sm mt-1">
                  {importResult.success ? (
                    <ul className="space-y-1 text-green-700">
                      <li>Panels imported: {importResult.panelsImported}</li>
                      <li>Fuses imported: {importResult.fusesImported}</li>
                      <li>Sockets imported: {importResult.socketsImported}</li>
                      <li>Devices imported: {importResult.devicesImported}</li>
                      <li>Rooms imported: {importResult.roomsImported}</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1 text-red-700">
                      {importResult.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* About */}
      <Card>
        <CardHeader title="About FuseMapper" />
        <CardBody>
          <p className="text-sm text-gray-600">
            FuseMapper is a self-hosted web application for visually mapping Norwegian and
            European fuse/breaker panels with drag-and-drop device assignment.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Version 1.0.0
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
