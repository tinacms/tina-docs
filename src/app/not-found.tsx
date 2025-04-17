import Image from "next/image";
import Link from "next/link";
import ErrorWrapper from "./error-wrapper";

export default function NotFound() {
  return (
    <ErrorWrapper description="We couldn't find what you were looking for." />
  );
}
