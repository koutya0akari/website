// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RichEditor } from "./RichEditor";

function setScrollableSize(element: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
  });
}

function waitForScrollSyncGuard() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

describe("RichEditor scroll behavior", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps editor and preview scroll independent by default and can toggle sync back on", async () => {
    render(
      <RichEditor
        value={["# Title", "本文", "## Section", "More text"].join("\n\n")}
        onChange={vi.fn()}
        minHeight={240}
      />,
    );

    const editor = screen.getByLabelText("エディター") as HTMLTextAreaElement;
    const preview = screen.getByLabelText("プレビュー") as HTMLDivElement;

    setScrollableSize(editor, 1_000, 200);
    setScrollableSize(preview, 800, 200);

    editor.scrollTop = 400;
    fireEvent.scroll(editor);
    expect(preview.scrollTop).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: /独立スクロール: ON/ }));

    editor.scrollTop = 500;
    fireEvent.scroll(editor);
    expect(preview.scrollTop).toBe(375);

    await waitForScrollSyncGuard();

    preview.scrollTop = 300;
    fireEvent.scroll(preview);
    expect(editor.scrollTop).toBe(400);
  });
});
