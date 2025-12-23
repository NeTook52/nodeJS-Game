const net = require('net');


console.log('Готов к игре...');

const server = net.createServer(function(socket) {
    let min = 0;
    let max = 0;
    let buffer = '';
    
    
    socket.on('data', function(data) {
        buffer += data.toString();
        
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const message = buffer.substring(0, newlineIndex);
            buffer = buffer.substring(newlineIndex + 1);
            
            try {
                const jsonData = JSON.parse(message);
                
                
                console.log('Получено от клиента:', JSON.stringify(jsonData));
                
                
                if (jsonData.range) {
                    const rangeParts = jsonData.range.split('-');
                    min = parseInt(rangeParts[0]);
                    max = parseInt(rangeParts[1]);
                    
                    
                    const guess = Math.floor((min + max) / 2);
                    const response = { answer: guess };
                    console.log('Отправляю:', JSON.stringify(response));
                    socket.write(JSON.stringify(response) + '\n');
                }
                
                else if (jsonData.hint) {
                    if (jsonData.hint === 'more') {
                        
                        min = Math.floor((min + max) / 2) + 1;
                    } else if (jsonData.hint === 'less') {
                       
                        max = Math.floor((min + max) / 2) - 1;
                    }
                    
                   
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


server.listen(5555, '127.0.0.1', function() {
    console.log('Сервер запущен на порту 5555');
});

