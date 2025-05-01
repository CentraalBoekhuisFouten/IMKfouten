import React, { useState, useEffect } from "react";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from "../utils/storage";

const ErrorsByDate = () => {
  const [dates, setDates] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [addingToDate, setAddingToDate] = useState(null);

  useEffect(() => {
    setDates(loadFromStorage("dates") || []);
    setEmployees(loadFromStorage("employees") || []);
  }, []);

  useEffect(() => {
    const newErrors = {};
    dates.forEach((date) => {
      newErrors[date] = loadFromStorage(`errors_${date}`) || {};
    });
    setErrors(newErrors);
  }, [dates]);

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDateSubmit = () => {
    const formattedDate = formatDate(newDate);
    if (!newDate || dates.includes(formattedDate) || selectedEmployees.length === 0) return;

    const updatedDates = [formattedDate, ...dates];
    setDates(updatedDates);
    saveToStorage("dates", updatedDates);

    const newErrorEntry = {};
    selectedEmployees.forEach((emp) => {
      newErrorEntry[emp] = { notScanned: 0, error2: 0, error3: 0 };
    });

    const updatedErrors = {
      ...errors,
      [formattedDate]: newErrorEntry,
    };

    setErrors(updatedErrors);
    saveToStorage(`errors_${formattedDate}`, newErrorEntry);
    setExpandedDates((prev) => ({ ...prev, [formattedDate]: true }));
    setNewDate("");
    setSelectedEmployees([]);
    setShowEmployeeSelector(false);
  };

  const deleteDate = (date) => {
    const updatedDates = dates.filter((d) => d !== date);
    setDates(updatedDates);
    saveToStorage("dates", updatedDates);

    removeFromStorage(`errors_${date}`);
    const newErrors = { ...errors };
    delete newErrors[date];
    setErrors(newErrors);
  };

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const updateErrorCount = (date, employee, errorType, change) => {
    const updatedErrors = { ...errors };
    if (!updatedErrors[date]) updatedErrors[date] = {};
    if (!updatedErrors[date][employee])
      updatedErrors[date][employee] = {
        notScanned: 0,
        error2: 0,
        error3: 0,
      };

    updatedErrors[date][employee][errorType] = Math.max(
      0,
      (updatedErrors[date][employee][errorType] || 0) + change
    );

    setErrors(updatedErrors);
    saveToStorage(`errors_${date}`, updatedErrors[date]);
  };

  const handleCheckboxChange = (employee) => {
    setSelectedEmployees((prev) =>
      prev.includes(employee)
        ? prev.filter((e) => e !== employee)
        : [...prev, employee]
    );
  };

  const openEmployeeSelector = (date = null) => {
    setAddingToDate(date);
    setShowEmployeeSelector(true);
    setSelectedEmployees([]);
  };

  const addEmployeesToExistingDate = () => {
    if (!addingToDate || selectedEmployees.length === 0) return;

    const updated = { ...errors };
    if (!updated[addingToDate]) updated[addingToDate] = {};

    selectedEmployees.forEach((emp) => {
      if (!updated[addingToDate][emp]) {
        updated[addingToDate][emp] = {
          notScanned: 0,
          error2: 0,
          error3: 0,
        };
      }
    });

    setErrors(updated);
    saveToStorage(`errors_${addingToDate}`, updated[addingToDate]);
    setShowEmployeeSelector(false);
    setSelectedEmployees([]);
    setAddingToDate(null);
  };

  return (
    <div className="errors-container">
      <h2>Datum</h2>

      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        className="date-picker"
      />
      <button
        className="add-btn"
        onClick={() => openEmployeeSelector(null)}
        disabled={!newDate}
      >
        Selecteer medewerkers voor nieuwe datum
      </button>

      <div className="dates-list">
        {dates.map((date) => (
          <div key={date}>
            <div className="date-header">
              <span onClick={() => toggleDate(date)}>
                {date} <span>{expandedDates[date] ? "▲" : "▼"}</span>
              </span>
              <div>
                <button
                  className="add-btn"
                  onClick={() => openEmployeeSelector(date)}
                >
                  ➕ Medewerkers toevoegen
                </button>
                <button className="delete-btn" onClick={() => deleteDate(date)}>
                  🗑
                </button>
              </div>
            </div>
            {expandedDates[date] && (
              <table className="errors-table">
                <thead>
                  <tr>
                    <th>Medewerker</th>
                    <th>Niet gescand</th>
                    <th>Fout 2</th>
                    <th>Fout 3</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(errors[date] || {}).map((employee) => (
                    <tr key={employee}>
                      <td>{employee}</td>
                      <td>
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "notScanned", -1)
                          }
                        >
                          -
                        </button>
                        {errors[date][employee]?.notScanned || 0}
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "notScanned", 1)
                          }
                        >
                          +
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "error2", -1)
                          }
                        >
                          -
                        </button>
                        {errors[date][employee]?.error2 || 0}
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "error2", 1)
                          }
                        >
                          +
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "error3", -1)
                          }
                        >
                          -
                        </button>
                        {errors[date][employee]?.error3 || 0}
                        <button
                          onClick={() =>
                            updateErrorCount(date, employee, "error3", 1)
                          }
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {showEmployeeSelector && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              {addingToDate
                ? `Voeg medewerkers toe aan ${addingToDate}`
                : "Selecteer medewerkers voor nieuwe datum"}
            </h3>
            <div>
              {employees.map((emp) => (
                <div key={emp}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp)}
                      onChange={() => handleCheckboxChange(emp)}
                    />
                    {emp}
                  </label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px" }}>
              <button
                className="add-btn"
                onClick={
                  addingToDate
                    ? addEmployeesToExistingDate
                    : handleDateSubmit
                }
              >
                Bevestigen
              </button>
              <button
                className="remove-btn"
                onClick={() => {
                  setShowEmployeeSelector(false);
                  setSelectedEmployees([]);
                  setAddingToDate(null);
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorsByDate;
