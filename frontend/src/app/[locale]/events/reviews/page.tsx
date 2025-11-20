import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";

const ReviewPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Review Page</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Record your reviews here.</p>
          </CardContent>
        </Card>
      </div>
    </DialogTemplate>
  );
};

export default ReviewPage;
