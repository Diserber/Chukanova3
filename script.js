document.addEventListener("DOMContentLoaded", () => {
    
    // === ЗАДАНИЕ 3: Динамическая сортировка таблицы по клику на шапку ===
    const headers = document.querySelectorAll('#myTable th');
    
    headers.forEach(headerCell => {
        headerCell.addEventListener('click', () => {
            const tableElement = headerCell.closest('table');
            const tbody = tableElement.querySelector('tbody');
            const headerIndex = Array.prototype.indexOf.call(headerCell.parentNode.children, headerCell);
            const type = headerCell.getAttribute('data-type');
            const currentIsAscending = headerCell.classList.contains('sort-asc');
            
            // Сбрасываем стрелочки у всех колонок
            headers.forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
            
            // Определяем новое направление
            const direction = currentIsAscending ? 'desc' : 'asc';
            headerCell.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');

            // Извлекаем строки для сортировки
            const rowsArray = Array.from(tbody.querySelectorAll('tr'));

            // Логика сортировки строк
            rowsArray.sort((rowA, rowB) => {
                const cellA = rowA.children[headerIndex].textContent.trim();
                const cellB = rowB.children[headerIndex].textContent.trim();

                if (type === 'number') {
                    return direction === 'asc' ? Number(cellA) - Number(cellB) : Number(cellB) - Number(cellA);
                } else {
                    // Сортировка по алфавиту с поддержкой русского языка
                    return direction === 'asc' 
                        ? cellA.localeCompare(cellB, 'ru') 
                        : cellB.localeCompare(cellA, 'ru');
                }
            });

            // Обновляем структуру таблицы отсортированными строками
            tbody.append(...rowsArray);
        });
    });


    // === ЗАДАНИЕ 1: Выгрузка всей таблицы в Excel файл ===
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const table = document.getElementById('myTable');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Данные таблицы" });
        XLSX.writeFile(workbook, "table_export.xlsx");
    });


    // === ЗАДАНИЕ 2: Выгрузка таблицы в формат PDF ===
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const element = document.getElementById('pdf-content');
        const options = {
            margin:       15,
            filename:     'table_export.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(options).from(element).save();
    });


    // Вспомогательные функции для ручного экспорта в текстовые форматы (JSON / CSV)
    function getTableData() {
        const table = document.getElementById('myTable');
        const tableHeaders = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
            let rowObject = {};
            tableHeaders.forEach((header, index) => {
                rowObject[header] = cells[index];
            });
            return rowObject;
        });
    }

    function downloadTextFile(content, fileName, contentType) {
        const link = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        link.href = URL.createObjectURL(file);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }


    // === ЗАДАНИЕ 2 (Дополнительно): Экспорт в JSON ===
    document.getElementById('exportJsonBtn').addEventListener('click', () => {
        const data = getTableData();
        const jsonString = JSON.stringify(data, null, 2);
        downloadTextFile(jsonString, 'table_data.json', 'application/json');
    });


    // === ЗАДАНИЕ 2 (Дополнительно): Экспорт в CSV ===
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
        const table = document.getElementById('myTable');
        const rows = Array.from(table.querySelectorAll('tr'));
        
        // Добавляем маркер \uFEFF для корректного отображения кириллицы в Excel
        const csvContent = "\uFEFF" + rows.map(row => {
            const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {
                let text = cell.textContent.trim();
                // Экранируем спецсимволы, если они встречаются в тексте ячейки
                if (text.includes(';') || text.includes('"') || text.includes('\n')) {
                    text = `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            return cells.join(';'); // Используем точку с запятой как разделитель
        }).join('\n');

        downloadTextFile(csvContent, 'table_data.csv', 'text/csv;charset=utf-8;');
    });

});
