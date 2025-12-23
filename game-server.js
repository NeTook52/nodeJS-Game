const net = require('net');

// Выводим сообщение о готовности
console.log('Готов к игре...');

const server = net.createServer(function(socket) {
    let min = 0;
    let max = 0;
    let buffer = '';
    
    // Обработка входящих данных
    socket.on('data', function(data) {
        buffer += data.toString();
        
        // Обрабатываем все полные JSON сообщения
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const message = buffer.substring(0, newlineIndex);
            buffer = buffer.substring(newlineIndex + 1);
            
            try {
                const jsonData = JSON.parse(message);
                
                // Логируем сообщение от клиента
                console.log('Получено от клиента:', JSON.stringify(jsonData));
                
                // Если получили диапазон, начинаем игру
                if (jsonData.range) {
                    const rangeParts = jsonData.range.split('-');
                    min = parseInt(rangeParts[0]);
                    max = parseInt(rangeParts[1]);
                    
                    // Первая попытка - берем середину диапазона
                    const guess = Math.floor((min + max) / 2);
                    const response = { answer: guess };
                    console.log('Отправляю:', JSON.stringify(response));
                    socket.write(JSON.stringify(response) + '\n');
                }
                // Если получили подсказку
                else if (jsonData.hint) {
                    if (jsonData.hint === 'more') {
                        // Число больше, увеличиваем минимум
                        min = Math.floor((min + max) / 2) + 1;
                    } else if (jsonData.hint === 'less') {
                        // Число меньше, уменьшаем максимум
                        max = Math.floor((min + max) / 2) - 1;
                    }
                    
                    // Вычисляем новую попытку
                    const guess = Math.floor((min + max) / 2);
                    const response = { answer: guess };
                    console.log('Отправляю:', JSON.stringify(response));
                    socket.write(JSON.stringify(response) + '\n');
                }
            } catch (e) {
                console.error('Ошибка парсинга JSON:', e);
            }
        }
    });
    
    socket.on('end', function() {
        console.log('Клиент отключился');
    });
});

// Слушаем на порту 5555
server.listen(5555, '127.0.0.1', function() {
    console.log('Сервер запущен на порту 5555');
});

