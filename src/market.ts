import { near, BigInt, JSONValue, json, ipfs, log, TypedMap, Value, typeConversion, BigDecimal, bigInt, bigDecimal } from "@graphprotocol/graph-ts"
import { Market, Offer } from "../generated/schema"

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i], 
      receipt.receipt, 
      receipt.outcome,
      receipt.block.header
    );
  }
}

//const list_contract_atributos_referencia = [];


function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  outcome: near.ExecutionOutcome,
  blockHeader: near.BlockHeader
): void {
    
  if (action.kind != near.ActionKind.FUNCTION_CALL) return;
  
  const data = action.toFunctionCall();

  //se obtiene el nombre del metodo que fue ejecutado en el smart contract
  const methodName = action.toFunctionCall().methodName;
  
  //este evento es disparado cuando el metodo es create_form
  if (methodName == 'nft_on_approve') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const token_id = data.get('token_id')
        const nft_contract_id = data.get('nft_contract_id')
        const owner_id = data.get('owner_id')
        const approval_id = data.get('approval_id')
        const started_at = data.get('started_at')
        const end_price = data.get('end_price')
        const ended_at = data.get('ended_at')
        const ft_token_id = data.get('ft_token_id')
        const is_auction = data.get('is_auction')
        const price = data.get('price')
        const transaction_fee = data.get('transaction_fee')

        if (!token_id || !nft_contract_id || !owner_id || !approval_id || !started_at || !end_price || !ended_at || !ft_token_id
          || !is_auction || !price || !transaction_fee) return
        
        const id = token_id.toString() + "|" + nft_contract_id.toString()

        let market = Market.load(id)
        if (!market) {
          let artist_id = token_id.toString().split("|")[0].toString()
          let typetoken_id = token_id.toString().split("|")[1].toString()
          let serie_id = token_id.toString().split(":")[0].toString()

          market = new Market(id)
          market.artist_id = artist_id
          market.typetoken_id = typetoken_id
          market.serie_id = serie_id
          market.token_id = token_id.toString()
          market.nft_contract_id = nft_contract_id.toString()
          market.owner_id = owner_id.toString()
          market.approval_id = approval_id.toI64() as i32
          if(!started_at.isNull()) { market.started_at = started_at.toString() }
          if(!end_price.isNull()) { market.end_price = end_price.toString() }
          if(!ended_at.isNull()) {market.ended_at = ended_at.toString() }
          if(!ft_token_id.isNull()) {market.ft_token_id = ft_token_id.toString() }
          if(!is_auction.isNull()) {market.is_auction = is_auction.toBool() }
          market.transaction_fee = transaction_fee.toString()
          
          
        }
        market.price = bigInt.fromString(price.toString())
        market.price_near = bigInt.fromString(price.toString()).divDecimal(BigDecimal.fromString("1000000000000000000000000"))
        market.save()
        
      }
    }
  }


  //eliminar nft del market
  if (methodName == 'delete_market_data') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();
      
      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const nft_contract_id = data.get('nft_contract_id')
        const token_id = data.get('token_id')

        if (!token_id || !nft_contract_id) return
        
        const id = token_id.toString() + "|" + nft_contract_id.toString()

        let market = Market.load(id)
        if (market) {
          market.delete()    
        }
                
      }
    }
  }


  if (methodName == 'resolve_purchase') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();
      
      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const buyer_id = data.get('buyer_id')
        const ft_token_id = data.get('ft_token_id')
        const nft_contract_id = data.get('nft_contract_id')
        const owner_id = data.get('owner_id')
        const price = data.get('price')
        const token_id = data.get('token_id')

        if (!token_id || !nft_contract_id || !owner_id || !buyer_id || !ft_token_id || !price) return
        
        const id = token_id.toString() + "|" + nft_contract_id.toString()

        let market = Market.load(id)
        if (market) {
          market.delete()    
        }
                
        
      }
    }
  }


  //agregar ofertas
  if (methodName == 'add_offer') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const buyer_id = data.get('buyer_id')
        const nft_contract_id = data.get('nft_contract_id')
        const token_id = data.get('token_id')
        const ft_token_id = data.get('ft_token_id')
        const price = data.get('price')

        if (!buyer_id || !nft_contract_id || !token_id || !ft_token_id || !price) return

        if(token_id.isNull()) return
        
        // agregando offerta

        let artist_id = token_id.toString().split("|")[0].toString()
        let typetoken_id = token_id.toString().split("|")[1].toString()
        let serie_id = token_id.toString().split(":")[0].toString()

        for(let i = 0; i < 10000; i++) {
          const id = token_id.toString() + "|" + nft_contract_id.toString() + "|" + i.toString()
          let offer = Offer.load(id)
          if (!offer) {
            offer = new Offer(id)
            offer.data_nft = token_id.toString() 
            offer.nft_contract_id = nft_contract_id.toString()
            offer.token_id = token_id.toString()
            offer.serie_id = serie_id
            offer.artist_id = artist_id
            offer.typetoken_id = typetoken_id
            offer.buyer_id = buyer_id.toString()
            offer.ft_token_id = ft_token_id.toString()
            offer.price = bigInt.fromString(price.toString())
            offer.price_near = bigInt.fromString(price.toString()).divDecimal(BigDecimal.fromString("1000000000000000000000000"))
            offer.save()
            break
          } else {
            if(offer.buyer_id == buyer_id.toString()) {
              offer.ft_token_id = ft_token_id.toString()
              offer.price = bigInt.fromString(price.toString())
              offer.price_near = bigInt.fromString(price.toString()).divDecimal(BigDecimal.fromString("1000000000000000000000000"))
              offer.save()
              break
            }
          }
          
        }
        
      }
    }
  }

  //quitar ofertas de la lista
  if (methodName == 'delete_offer' || methodName == 'resolve_offer') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();
      
      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const nft_contract_id = data.get('nft_contract_id')
        const token_id = data.get('token_id')
        const buyer_id = data.get('buyer_id')

        if (!token_id || !nft_contract_id || !buyer_id) return
        
        for(let i = 0; i < 10000; i++) {
          const id = token_id.toString() + "|" + nft_contract_id.toString() + "|" + i.toString()

          let offer = Offer.load(id)
          if(offer) {
            offer.delete()
          } else {
            break
          }
        }
                
      }
    }
  }

  //quitar ofertas de la lista
  if (methodName == 'delete_offer2' || methodName == 'resolve_offer2') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();
      
      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const nft_contract_id = data.get('nft_contract_id')
        const token_id = data.get('token_id')
        const buyer_id = data.get('buyer_id')

        if (!token_id || !nft_contract_id || !buyer_id) return
        
        for(let i = 0; i < 10000; i++) {
          const id = token_id.toString() + "|" + nft_contract_id.toString() + "|" + i.toString()

          let offer = Offer.load(id)
          if(offer) {
            offer.delete()
          } else {
            break
          }
        }
                
      }
    }
  }



}