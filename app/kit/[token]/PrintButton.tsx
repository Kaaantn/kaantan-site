"use client";

import { Download } from "lucide-react";
import styles from "../kit.module.css";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className={styles.printBtn} onClick={() => window.print()}>
      <Download size={15} /> {label}
    </button>
  );
}
