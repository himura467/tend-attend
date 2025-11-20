import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";

const GoalPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Goal Page</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Record your goals here.</p>
          </CardContent>
        </Card>
      </div>
    </DialogTemplate>
  );
};

export default GoalPage;
