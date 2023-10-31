import { Inter } from 'next/font/google'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"


import { UserCircle2 } from 'lucide-react'
import { useState, useEffect } from "react"
import * as nearApi from 'near-api-js';

const inter = Inter({ subsets: ['latin'] })
const { connect, keyStores, WalletConnection, utils } = nearApi;
// const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isConnectButtonVisible, setIsConnectButtonVisible] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [tipUser, setTipUser] = useState('');
  const [tipAmount, setTipAmount] = useState('');

  useEffect(() => {
    async function initializeNear() {
      if (typeof window !== "undefined") {
        const myKeyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
        const connectionConfig = {
          networkId: 'testnet',
          keyStore: myKeyStore,
          nodeUrl: 'https://rpc.testnet.near.org',
          walletUrl: 'https://wallet.testnet.near.org',
          helperUrl: 'https://helper.testnet.near.org',
          explorerUrl: 'https://explorer.testnet.near.org',
        };
        const nearConnection = await nearApi.connect(connectionConfig);
        const newWallet = new nearApi.WalletConnection(nearConnection, 'testnear');
        setWallet(newWallet);
        updateUI(newWallet);
      }
    }
    initializeNear()
  } ,[])

  const updateUI = async (wallet) => {
    if (wallet.isSignedIn()) {
      const accountId = wallet.getAccountId();
      setAccountId(accountId);

      const account = await wallet.account();
      const accountBalance = await account.getAccountBalance();
      setAccountBalance(`${utils.format.formatNearAmount(accountBalance.available, 2)} Ⓝ`);
      setIsButtonVisible(true);
      setIsConnectButtonVisible(false);
      console.log(accountId);
      console.log(utils.format.formatNearAmount(accountBalance.available, 2));
    } else {
      setAccountId('Not signed in');
      setAccountBalance('');
      setIsButtonVisible(false);
      setIsConnectButtonVisible(true);
    }
  };

  const sendTip = async () => {
    if (tipUser === '' || tipAmount === '') {
      alert('Please enter a valid tip amount and user');
      return;
    }

    try {
      const yoctoNEARTipAmount = utils.format.parseNearAmount(tipAmount);

      if (!wallet.isSignedIn()) {
        alert('Please connect the wallet and sign in.');
        return;
      }

      let account;
      if (wallet.isSignedIn()) {
        account = wallet.account();
      } else {
        account = nearConnection.account(wallet.getAccountId());
      }

      // Send the tip
      await account.sendMoney(tipUser, yoctoNEARTipAmount);

      alert('Tip sent successfully');
    } catch (error) {
      alert('Error sending tip: ' + error);
      console.log(error);
    }
  };

  const handleSignIn = async () => {
    console.log('Signing in');
    await wallet.requestSignIn('testnear');
    updateUI(wallet);
  };

  const handleSignOut = () => {
    wallet.signOut();
    updateUI(wallet);
  };
  return (
    <main>
        <nav className="p-4">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="text-white text-2xl font-bold">NEAR Send</a>
            {isConnectButtonVisible && !wallet?.isSignedIn() && (
              <Button onClick={() => handleSignIn()}>Connect Wallet</Button>
            )}
            {isButtonVisible && wallet?.isSignedIn() && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <UserCircle2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Account</h4>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Address</Label>
                        <p
                          id="width"
                          defaultValue="100%"
                          className="col-span-2 h-8 text-sm">
                            {accountId}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width"> Account Balance (Ⓝ)</Label>
                        <p
                          id="width"
                          defaultValue="100%"
                          className="col-span-2 h-8 text-sm">
                            {accountBalance}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Button onClick={()=> handleSignOut()} variant="secondary">Disconnect</Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </nav>

        <Card>
          <CardHeader>
              <CardTitle>Send Token</CardTitle>
              <CardDescription>Send Crypto Tokens to other addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="address"> Address </Label>
                    <Input id="address" placeholder="Enter your crypto address Eg. xxx.near" value={tipUser} onChange={(e) => setTipUser(e.target.value)}/>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="amount"> Amount Ⓝ </Label>
                    <div className='flex'>
                      <Button type="button" variant='outline' onClick={() => setTipAmount("1")}> 1 </Button>
                      <Button type="button" variant='outline' onClick={() => setTipAmount("2")}> 2 </Button>
                      <Button type="button" variant='outline' onClick={() => setTipAmount("5")}> 5 </Button>
                      <Button type="button" variant='outline' onClick={() => setTipAmount("10")}> 10 </Button>
                    </div>
                    <Input id="amount" placeholder="Enter your amount" value={tipAmount} onChange={(e)=>  setTipAmount(e.target.value)} />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {setTipAmount(""); setTipUser("")}}>Clear</Button>
              <Button onClick={sendTip}>Send</Button>
            </CardFooter>
        </Card>
        {/* <Table>
          <TableCaption>A list of your recent transactions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date Time</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
          </TableBody>
        </Table> */}
    </main>
  )
}

