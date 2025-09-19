import React, { useState } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function History() {
  // Dummy data for now
  const machineData = [
    {
      id: 1,
      name: "Machine A",
      cylinderHistory: [
        { brand: "OxyPure", weight: "15kg", date: "2025-08-01 10:30 AM" },
        { brand: "NitroGas", weight: "20kg", date: "2025-07-15 03:10 PM" },
      ],
      gasUsage: [
        { period: "Daily", consumption: "5kg", remaining: "70%" },
        { period: "Weekly", consumption: "30kg", remaining: "40%" },
      ],
      leakEvents: [
        {
          date: "2025-08-05 11:00 AM",
          affected: "Cylinder 2",
          alert: "Critical",
        },
      ],
      valveLogs: [
        {
          date: "2025-08-02 09:00 AM",
          action: "Opened",
          mode: "Automatic",
          reason: "Scheduled",
        },
      ],
      alerts: [
        { date: "2025-08-06 04:20 PM", type: "Low Gas" },
      ],
    },
    {
      id: 2,
      name: "Machine B",
      cylinderHistory: [
        { brand: "GasPro", weight: "18kg", date: "2025-08-03 02:15 PM" },
      ],
      gasUsage: [
        { period: "Daily", consumption: "4kg", remaining: "80%" },
        { period: "Weekly", consumption: "28kg", remaining: "50%" },
      ],
      leakEvents: [],
      valveLogs: [],
      alerts: [],
    },
  ];

  const [selectedMachine, setSelectedMachine] = useState("");

  const machine = machineData.find((m) => m.id === selectedMachine);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Machine History
      </Typography>

      {/* Machine Dropdown */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Machine</InputLabel>
        <Select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
        >
          <MenuItem value="">-- Choose a Machine --</MenuItem>
          {machineData.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Show history only when machine is selected */}
      {machine && (
        <div>
          {/* Cylinder Replacement History */}
          <HistoryAccordion title="Cylinder Replacement History">
            <HistoryTable
              headers={["Cylinder Brand", "Gas Weight", "Date & Time"]}
              rows={machine.cylinderHistory.map((item) => [
                item.brand,
                item.weight,
                item.date,
              ])}
            />
          </HistoryAccordion>

          {/* Gas Usage History */}
          <HistoryAccordion title="Gas Usage History">
            <HistoryTable
              headers={["Period", "Consumption", "Remaining Gas"]}
              rows={machine.gasUsage.map((item) => [
                item.period,
                item.consumption,
                item.remaining,
              ])}
            />
          </HistoryAccordion>

          {/* Leak Detection Events */}
          <HistoryAccordion title="Leak Detection Events">
            {machine.leakEvents.length > 0 ? (
              <HistoryTable
                headers={["Date & Time", "Machine Affected", "Alert Level"]}
                rows={machine.leakEvents.map((item) => [
                  item.date,
                  item.affected,
                  <Chip
                    label={item.alert}
                    color={item.alert === "Critical" ? "error" : "warning"}
                  />,
                ])}
              />
            ) : (
              <Typography color="text.secondary">
                No leak events recorded.
              </Typography>
            )}
          </HistoryAccordion>

          {/* Valve Operation Logs */}
          <HistoryAccordion title="Valve Operation Logs">
            {machine.valveLogs.length > 0 ? (
              <HistoryTable
                headers={["Date & Time", "Action", "Mode", "Reason"]}
                rows={machine.valveLogs.map((item) => [
                  item.date,
                  item.action,
                  item.mode,
                  item.reason,
                ])}
              />
            ) : (
              <Typography color="text.secondary">
                No valve operation logs available.
              </Typography>
            )}
          </HistoryAccordion>

          {/* Alert & Buzzer Triggers */}
          <HistoryAccordion title="Alert & Buzzer Triggers">
            {machine.alerts.length > 0 ? (
              <HistoryTable
                headers={["Date & Time", "Alert Type"]}
                rows={machine.alerts.map((item) => [item.date, item.type])}
              />
            ) : (
              <Typography color="text.secondary">
                No alert and buzzer triggers.
              </Typography>
            )}
          </HistoryAccordion>
        </div>
      )}
    </Container>
  );
}

/* Component for collapsible sections */
function HistoryAccordion({ title, children }) {
  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

/* Reusable Table Component */
function HistoryTable({ headers, rows }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.map((h, i) => (
              <TableCell key={i} sx={{ fontWeight: "bold" }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
