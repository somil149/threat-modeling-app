import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateRisk, getSeverityFromRisk } from '../components/ThreatPanel';

export const exportToPDF = (nodes, threats) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text("Deterministic Threat Model Report", 14, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary Stats
  const allThreats = Object.values(threats).flat();
  let criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0;
  
  allThreats.forEach(t => {
    const s = getSeverityFromRisk(calculateRisk(t.likelihood||3, t.impact||3));
    if (s === 'Critical') criticalCount++;
    if (s === 'High') highCount++;
    if (s === 'Medium') mediumCount++;
    if (s === 'Low') lowCount++;
  });

  doc.setTextColor(0);
  doc.text("Executive Summary:", 14, 45);
  doc.text(`Critical Threats: ${criticalCount}`, 14, 52);
  doc.text(`High Threats: ${highCount}`, 14, 59);
  doc.text(`Medium Threats: ${mediumCount}`, 14, 66);
  doc.text(`Low Threats: ${lowCount}`, 14, 73);

  // Table
  const tableData = [];
  nodes.forEach(n => {
    const nodeThreats = threats[n.id] || [];
    nodeThreats.forEach(t => {
      const risk = calculateRisk(t.likelihood||3, t.impact||3);
      tableData.push([
        n.data.label,
        t.title,
        t.category,
        getSeverityFromRisk(risk),
        risk.toString(),
        t.status
      ]);
    });
  });

  doc.autoTable({
    startY: 85,
    head: [['Component', 'Threat', 'Category', 'Severity', 'Risk Score', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save('threat-model-report.pdf');
};

export const exportToCSV = (nodes, threats) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Component,Threat Title,Category,Severity,Risk Score,Status,Description\n";

  nodes.forEach(n => {
    const nodeThreats = threats[n.id] || [];
    nodeThreats.forEach(t => {
      const risk = calculateRisk(t.likelihood||3, t.impact||3);
      const severity = getSeverityFromRisk(risk);
      const row = `"${n.data.label}","${t.title}","${t.category}","${severity}","${risk}","${t.status}","${t.desc.replace(/"/g, '""')}"`;
      csvContent += row + "\n";
    });
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "threat_model.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToMarkdown = (nodes, threats) => {
  let md = "# Threat Model Security Report\n\n";
  
  nodes.forEach(n => {
    const nodeThreats = threats[n.id] || [];
    if (nodeThreats.length > 0) {
      md += `## Component: ${n.data.label} (${n.type})\n\n`;
      md += `| Threat | Category | Severity | Risk Score | Status |\n`;
      md += `|---|---|---|---|---|\n`;
      nodeThreats.forEach(t => {
        const risk = calculateRisk(t.likelihood||3, t.impact||3);
        md += `| ${t.title} | ${t.category} | ${getSeverityFromRisk(risk)} | ${risk} | ${t.status} |\n`;
      });
      md += "\n";
    }
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "SECURITY.md";
  link.click();
};
