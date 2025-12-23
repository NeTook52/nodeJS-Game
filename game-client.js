const net = require('net');

// Получаем аргументы командной строки
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error('Использование: node game-client.js <min> <max>');
    process.exit(1);
}

const min = parseInt(args[0]);
const max = parseInt(args[1]);

// Загадываем случайное число
const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;
console.log('Загадано число:', secretNumber);

// Подключаемся к серверу
const socket = net.createConnection({ port: 5555, host: '127.0.0.1' }, function() {
    // Отправляем диапазон серверу
    const rangeMessage = { range: `${min}-${max}` };
    console.log('Отправляю диапазон:', JSON.stringify(rangeMessage));
    socket.write(JSON.stringify(rangeMessage) + '\n');
});

let buffer = '';

// Обработка ответов от сервера
socket.on('data', function(data) {
    buffer += data.toString();
    
    // Обрабатываем все полные JSON сообщения
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, newlineIndex);
        buffer = buffer.substring(newlineIndex + 1);
        
        try {
            const jsonData = JSON.parse(message);
            
            // Логируем ответ сервера
            console.log('Ответ сервера:', JSON.stringify(jsonData));
            
            const serverGuess = jsonData.answer;
            
            // Проверяем ответ сервера
            if (serverGuess < secretNumber) {
                // Число больше
                const hint = { hint: 'more' };
                console.log('Отправляю подсказку:', JSON.stringify(hint));
                socket.write(JSON.stringify(hint) + '\n');
            } else if (serverGuess > secretNumber) {
                // Число меньше
                const hint = { hint: 'less' };
                console.log('Отправляю подсказку:', JSON.stringify(hint));
                socket.write(JSON.stringify(hint) + '\n');
            } else {
                // Угадал!
                console.log('Сервер угадал число! Игра окончена.');
                socket.end();
                process.exit(0);
            }
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
        }
    }
});

socket.on('error', function(err) {
    console.error('Ошибка соединения:', err);
    process.exit(1);
});

