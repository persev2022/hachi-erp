import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Platform — AWS Infrastructure Analysis",
  description: "AWS infrastructure cost estimation and analysis for the Hachi Platform",
};

export default function AwsCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
