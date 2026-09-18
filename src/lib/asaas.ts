function getApiUrl(): string {
  const url = process.env.ASAAS_API_URL;
  if (!url) throw new Error("ASAAS_API_URL não configurado.");
  return url.replace(/\/+$/, "");
}

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurado.");
  return key;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Asaas ${path} falhou (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

type AsaasCustomer = { id: string };
type AsaasCustomerList = { data: AsaasCustomer[] };
type AsaasPayment = { id: string };
type AsaasPixQrCode = { encodedImage: string; payload: string };

export async function findOrCreateAsaasCustomer(
  name: string,
  cpf: string,
): Promise<string> {
  const cleanCpf = cpf.replace(/\D/g, "");

  const existing = await asaasFetch<AsaasCustomerList>(
    `/customers?cpfCnpj=${cleanCpf}`,
  );
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const created = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({ name, cpfCnpj: cleanCpf }),
  });

  return created.id;
}

export async function createPixPayment(params: {
  customerId: string;
  value: number;
  externalReference: string;
  description: string;
}): Promise<{
  paymentId: string;
  qrCodeImage: string;
  qrCodePayload: string;
}> {
  const dueDate = new Date().toISOString().slice(0, 10);

  const payment = await asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "PIX",
      value: params.value,
      dueDate,
      externalReference: params.externalReference,
      description: params.description,
    }),
  });

  const qrCode = await asaasFetch<AsaasPixQrCode>(
    `/payments/${payment.id}/pixQrCode`,
  );

  return {
    paymentId: payment.id,
    qrCodeImage: qrCode.encodedImage,
    qrCodePayload: qrCode.payload,
  };
}
