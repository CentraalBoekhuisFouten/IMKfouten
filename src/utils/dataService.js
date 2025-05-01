// Заглушка для имитации сохранения и загрузки сотрудников из "файла"

export const loadData = async () => {
  try {
    const data = localStorage.getItem("employeesFile");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Ошибка при загрузке из файла:", error);
    return [];
  }
};

export const saveData = (employees) => {
  try {
    localStorage.setItem("employeesFile", JSON.stringify(employees));
    alert("Сотрудники успешно сохранены в 'файл'");
  } catch (error) {
    console.error("Ошибка при сохранении в файл:", error);
  }
};
