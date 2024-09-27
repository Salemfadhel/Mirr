let wallet;
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
const commissionAddress = "Abwr4CRHJukH32n363Pj33kJkH1JBHsQhWLqbUwGVW4g";

async function connectWallet() {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
        try {
            wallet = await provider.connect();
            document.getElementById('createToken').disabled = false;
            console.log("Wallet connected:", wallet.publicKey.toString());
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            alert("Connection failed. Please try again.");
        }
    } else {
        alert("Please install Phantom Wallet!");
    }
}

async function createToken() {
    try {
        const balance = await connection.getBalance(wallet.publicKey);
        const creationCost = 0.001 * solanaWeb3.LAMPORTS_PER_SOL;

        if (balance < creationCost) {
            alert("Insufficient funds. You need at least 0.001 SOL to create a token.");
            return;
        }

        const name = document.getElementById('tokenName').value;
        const symbol = document.getElementById('tokenSymbol').value;
        const totalSupply = parseInt(document.getElementById('totalSupply').value, 10);

        if (!name || !symbol || !totalSupply || totalSupply <= 0) {
            alert("Please fill in all fields correctly.");
            return;
        }

        // Transfer commission to the specified address
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new solanaWeb3.PublicKey(commissionAddress),
                lamports: creationCost
            })
        );

        await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);

        // Create the token
        const mint = await splToken.Token.createMint(
            connection,
            wallet,
            wallet.publicKey,
            null,
            9,
            splToken.TOKEN_PROGRAM_ID
        );

        const token = new splToken.Token(
            connection,
            mint,
            splToken.TOKEN_PROGRAM_ID,
            wallet
        );

        const userTokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet.publicKey);
        await token.mintTo(userTokenAccount.address, wallet.publicKey, [], totalSupply);

        console.log("Token created:", mint.toString());
        alert(`Token created successfully!\nName: ${name}\nSymbol: ${symbol}\nTotal Supply: ${totalSupply}`);
    } catch (error) {
        console.error("Error creating token:", error);
        alert("Failed to create token. Check console for details.");
    }
}

document.getElementById('connectWallet').onclick = connectWallet;
document.getElementById('createToken').onclick = createToken;
