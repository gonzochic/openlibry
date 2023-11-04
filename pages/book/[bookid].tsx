import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getAllTopics, getBook } from "../../entities/book";

import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/router";
import { forwardRef } from "react";

import {
  convertStringToDay,
  replaceBookDateString,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";

import BookEditForm from "@/components/book/BookEditForm";
import { Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function BookDetail({ user, book, topics }: any) {
  const router = useRouter();

  const [bookData, setBookData] = useState(book);
  const [returnBookSnackbar, setReturnBookSnackbar] = useState(false);

  useEffect(() => {
    setBookData(book);
  }, []);

  if (!router.query.bookid) {
    return <Typography>ID not found</Typography>;
  }

  const bookid = parseInt(
    Array.isArray(router.query.bookid)
      ? router.query.bookid[0]
      : router.query.bookid
  );

  const handleCloseReturnBookSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setReturnBookSnackbar(false);
  };

  const handleSaveButton = () => {
    console.log("Saving book ", bookData);
    //convert eventual dates
    bookData.rentedDate = convertStringToDay(bookData.rentedDate);
    bookData.dueDate = convertStringToDay(bookData.dueDate);

    //we don't need to update the dates
    const { updatedAt, createdAt, ...savingBook } = bookData;

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savingBook),
    })
      .then((res) => res.json())
      .then((data) => {});
  };

  const handleReturnBookButton = (userid: number) => {
    console.log("Returning book ", bookid);

    fetch("/api/book/" + bookid + "/user/" + userid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setReturnBookSnackbar(true);
      });
  };

  const handleDeleteButton = () => {
    console.log("Deleting book ", bookData);

    fetch("/api/book/" + bookid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete operation performed on ", bookid, data);
        router.push("/book");
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <BookEditForm
          user={user}
          book={bookData}
          setBookData={setBookData}
          deleteBook={handleDeleteButton}
          saveBook={handleSaveButton}
          returnBook={handleReturnBookButton}
          topics={topics}
        />
        <Snackbar
          open={returnBookSnackbar}
          autoHideDuration={8000}
          onClose={handleCloseReturnBookSnackbar}
        >
          <Alert
            onClose={handleCloseReturnBookSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            Buch zurückgegeben, super!
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const prisma = new PrismaClient();

  const dbbook = await getBook(prisma, parseInt(context.query.bookid));
  if (!dbbook) {
    return {
      notFound: true,
    };
  }

  const dbtopics = await getAllTopics(prisma);
  const topics: string[] = [];
  if (dbtopics != null) {
    const redundanttopics: string[] = [];
    dbtopics.map((t) => {
      if ("topics" in t && t.topics != null) {
        const singletopics = t.topics.split(";");
        singletopics.map((s) => {
          const filteredTopic = s.trim();
          s.trim().length > 0 ? redundanttopics.push(s) : 0;
        });
      }
    });

    //const topics = [...new Set(redundanttopics)];

    redundanttopics.map((element: any) => {
      if (!topics.includes(element)) {
        topics.push(element);
      }
    });
  }

  //console.log("Found these topics:", topics);

  if (!dbbook) return;

  const book = replaceBookDateString(dbbook);
  //const imagesArray = await getImages();
  //console.log("Images", imagesArray);
  //push array to object for performance reasons
  //const images = {};
  //imagesArray.map((i) => ((images as any)[i] = "1"));

  if (!("id" in book) || !book.id) return; //shouldn't happen

  // Pass data to the page via props
  return { props: { book, topics } };
}
