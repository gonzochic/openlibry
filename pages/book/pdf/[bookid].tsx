import React, { useState } from "react";
import { useRouter } from "next/router";
import Barcode from "react-barcode";
import { Typography } from "@mui/material";
import Layout from "@/components/layout/Layout";

export default function Home() {
  const router = useRouter();
  if (!router.query.bookid) {
    return <Typography>ID not found</Typography>;
  }

  const bookid = parseInt(
    Array.isArray(router.query.bookid)
      ? router.query.bookid[0]
      : router.query.bookid
  );
  return (
    <Layout>
      <Typography>Barcode</Typography>

      <Barcode
        value={bookid.toString()}
        height={90}
        width={1.5}
        fontOptions="600"
        textMargin={4}
        margin={0}
      />
    </Layout>
  );
}