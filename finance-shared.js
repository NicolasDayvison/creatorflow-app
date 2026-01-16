// Finance Shared Module - Conecta Finance com Dashboard e Tasks

export async function getFinanceData(db, userId, appId = 'creatorflow-app') {
    const { collection, onSnapshot, query, orderBy } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js').then(m => ({
        collection: m.collection,
        onSnapshot: m.onSnapshot,
        query: m.query,
        orderBy: m.orderBy
    }));

    return new Promise((resolve) => {
        const q = query(collection(db, 'artifacts', appId, 'users', userId, 'transactions'), orderBy('date', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            let income = 0;
            let expense = 0;
            let barter = 0;
            const transactions = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                transactions.push({ id: doc.id, ...data });
                
                const val = parseFloat(data.amount);
                if (data.type === 'income') income += val;
                else if (data.type === 'expense') expense += val;
                else if (data.type === 'barter') barter += 1;
            });

            resolve({
                income: parseFloat(income.toFixed(2)),
                expense: parseFloat(expense.toFixed(2)),
                balance: parseFloat((income - expense).toFixed(2)),
                barter,
                transactions
            });
        }, { once: true });
    });
}

export function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function getFinanceStatus(balance) {
    if (balance >= 1000) return { color: 'text-green-400', status: 'Excelente' };
    if (balance >= 500) return { color: 'text-blue-400', status: 'Bom' };
    if (balance > 0) return { color: 'text-yellow-400', status: 'Atenção' };
    return { color: 'text-red-400', status: 'Crítico' };
}
