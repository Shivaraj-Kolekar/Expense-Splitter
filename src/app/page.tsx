"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  const [tab, setTab] = useState("equal");
  const [expense, setExpense] = useState<number | "">("");
  const [numPeople, setNumPeople] = useState<number | "">("");
  const [names, setNames] = useState<string[]>([]);
  const [shares, setShares] = useState<number[]>([]);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [result, setResult] = useState<{ name: string; amount: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle number of people change
  const handleNumPeople = (val: string) => {
    const n = Number(val);
    setNumPeople(val === "" ? "" : n);
    if (!isNaN(n) && n > 0) {
      setNames(Array(n).fill(""));
      setShares(Array(n).fill(1));
      setAmounts(Array(n).fill(0));
    } else {
      setNames([]);
      setShares([]);
      setAmounts([]);
    }
  };

  // Handle name change
  const handleNameChange = (idx: number, val: string) => {
    const updated = [...names];
    updated[idx] = val;
    setNames(updated);
  };

  // Handle share change
  const handleShareChange = (idx: number, val: string) => {
    const updated = [...shares];
    updated[idx] = Number(val) || 0;
    setShares(updated);
  };

  // Handle amount change
  const handleAmountChange = (idx: number, val: string) => {
    const updated = [...amounts];
    updated[idx] = Number(val) || 0;
    setAmounts(updated);
  };

  // Split logic
  const handleSplit = () => {
    if (!expense || !numPeople || names.some((n) => !n)) return;
    let res: { name: string; amount: number }[] = [];
    if (tab === "equal") {
      const amt = Number(expense) / Number(numPeople);
      res = names.map((name) => ({ name, amount: parseFloat(amt.toFixed(2)) }));
    } else if (tab === "shares") {
      const totalShares = shares.reduce((a, b) => a + b, 0);
      res = names.map((name, i) => ({
        name,
        amount: parseFloat(
          ((Number(expense) * shares[i]) / totalShares).toFixed(2),
        ),
      }));
    } else if (tab === "amounts") {
      res = names.map((name, i) => ({
        name,
        amount: parseFloat((amounts[i] || 0).toFixed(2)),
      }));
    }
    setResult(res);
  };

  // Download card as image
  const handleDownload = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement("a");
    link.download = "split-result.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl text-center mb-4 text-font-bold">
        Splits Expenses with ease.
      </h1>
      <Card>
        <CardHeader>Split Expenses</CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="equal">By People</TabsTrigger>
              <TabsTrigger value="shares">By Shares</TabsTrigger>
              <TabsTrigger value="amounts">By Amount</TabsTrigger>
            </TabsList>
            <div className="flex flex-col gap-4">
              <div>
                <label>Amount</label>
                <Input
                  type="number"
                  value={expense}
                  onChange={(e) =>
                    setExpense(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Enter total amount"
                />
              </div>
              <div>
                <label>Number of People</label>
                <Input
                  type="number"
                  value={numPeople}
                  onChange={(e) => handleNumPeople(e.target.value)}
                  placeholder="Enter number of people"
                  min={1}
                />
              </div>
              {names.map((name, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Person ${idx + 1} name`}
                  />
                  {tab === "shares" && (
                    <Input
                      type="number"
                      value={shares[idx]}
                      min={1}
                      onChange={(e) => handleShareChange(idx, e.target.value)}
                      placeholder="Share"
                      className="w-20"
                    />
                  )}
                  {tab === "amounts" && (
                    <Input
                      type="number"
                      value={amounts[idx]}
                      min={0}
                      onChange={(e) => handleAmountChange(idx, e.target.value)}
                      placeholder="Amount"
                      className="w-24"
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleSplit}>Split</Button>
            </div>
            <TabsContent value={tab} />
          </Tabs>
        </CardContent>
      </Card>
      {result.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <Card ref={cardRef as any} className="w-full max-w-md">
            <CardHeader>Split Result</CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {result.map((r, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 flex justify-between"
                  >
                    <span>{r.name}</span>
                    <span>₹ {r.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/*<Button className="mt-4" onClick={handleDownload}>
            Download as Image
          </Button>*/}
        </div>
      )}
    </div>
  );
}
