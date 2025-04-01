import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { error } from "console";
import { Voting } from "anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";
const IDL= require('anchor/target/idl/voting.json')

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://imgs.search.brave.com/Jmqc0VTUoAPcIQa0y1oYaduontYHOfzNaJGYwGFzSiw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDIxNTcy/ODIuanBn",
        title: "Vote for your Fav type of sweet",
        description: "Vote between Gulab jamun and other Sweets",
        label: "Vote",
        links: {
            actions: [
                {
                    href: "/api/vote?candidate=gulabjamun",
                    label: "Vote for Gulab Jamun",
                    type: "transaction"
                },
                {
                    href: "/api/vote?candidate=rasgulla",
                    label: "Vote for Rasgulla",
                    type: "transaction"
                }
            ]
        }
    };
    
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

// Define OPTIONS to be the same as GET for CORS preflight requests
export const OPTIONS = GET;

// export async function POST(request: Request){

//     const url= new URL(request.url);
//     const candidate= url.searchParams.get("candidate");
//     if(candidate!="Gulab Jamun" && candidate!="Rasgulla"){
//         return new Response("Invalid candidate",{status:400,headers: ACTIONS_CORS_HEADERS});
//     }
//     const connection=new Connection("http://127.0.0.1:8899","confirmed");
//     const body: ActionPostRequest= await request.json();
//     let voter=new PublicKey(body.account);
//     try{
//         voter= new PublicKey(body.account);
//     }catch(error){
//         return new Response("Invalid account",{status: 400, headers: ACTIONS_CORS_HEADERS});
//     }
//     const program: Program<Voting> =new Program(IDL,{connection});


//     const blockhash= await connection.getLatestBlockhash();

//     const transaction = new Transaction({
//         feePayer: voter, 
//         blockhash : blockhash.blockhash,
//         lastValidBlockHeight: blockhash.lastValidBlockHeight,
//     }
        
         
//     ).add(instruction);

//     const response = await createPostResponse({
//         fields: {
//             transaction: transaction,
//             type: "transaction",
//         }
//     });

//     return Response.json(response,{headers: ACTIONS_CORS_HEADERS});
// }


export async function POST(request: Request) {
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate");
    
    // Fix case-sensitivity - convert both to the same case for comparison
    if (candidate?.toLowerCase() !== "gulabjamun" && candidate?.toLowerCase() !== "rasgulla") {
        return new Response("Invalid candidate", {status: 400, headers: ACTIONS_CORS_HEADERS});
    }
    
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const body: ActionPostRequest = await request.json();
    
    let voter;
    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        return new Response("Invalid account", {status: 400, headers: ACTIONS_CORS_HEADERS});
    }
    
    // Convert candidate format for the program if needed
    // If your program expects "Gulab Jamun" with proper spacing and capitalization
    const formattedCandidate = candidate === "gulabjamun" ? "Gulab Jamun" : "Rasgulla";
    
    const program: Program<Voting> = new Program(IDL, {connection});
    
    // Get the poll address
    const [pollAddress] = PublicKey.findProgramAddressSync(
        [new BN(1).toArrayLike(Buffer, "le", 8)],
        program.programId
    );
    
    // Get the candidate address
    const [candidateAddress] = PublicKey.findProgramAddressSync(
        [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from(formattedCandidate)],
        program.programId
    );
    

    const instruction = await program.methods
        .vote(candidate, new BN(1))
        .accounts({
            signer: voter,

        })
        .instruction();

    const blockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer: voter, 
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction);  // Fixed parenthesis placement

    const response = await createPostResponse({
        fields: {
            transaction: transaction,
            type: "transaction",
        }
    });

    return Response.json(response, {headers: ACTIONS_CORS_HEADERS});
}