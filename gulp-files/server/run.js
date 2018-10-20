import child_process from 'child_process';

module.exports = (gulp) => {
    let node;

    process.on('exit', () => {
        if (node)
            node.kill();
    });

    return async () => {
        if (node)
            node.kill();

        node = child_process.spawn('node', ['dist/server/server.js'], { stdio: 'inherit' });

        node.on('close', () => {
            console.log('Node closed');
        })
    }
};
