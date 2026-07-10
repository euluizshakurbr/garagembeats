export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Gera um arquivo JPEG recortado a partir da imagem original e da área
// selecionada no cropper (react-easy-crop devolve pixels da área).
export async function getCroppedImage(
  src: string,
  area: Area,
  fileName = "capa.jpg"
): Promise<File> {
  const image = await carregarImagem(src);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );
  if (!blob) throw new Error("Falha ao recortar a imagem");

  return new File([blob], fileName, { type: "image/jpeg" });
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });
}
