
import { useState } from "react";
import { Book, ChevronDown, ChevronUp, Clock, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function TOILPolicyGuide() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Company TOIL Policy</CardTitle>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <CardDescription>Guidelines for Time Off In Lieu</CardDescription>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is TOIL?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700">
                  Time Off In Lieu (TOIL) is time off which you are allowed to take instead of 
                  receiving overtime pay for extra hours worked. This system allows you to 
                  record your extra hours worked and later book time off in exchange.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Eligibility for TOIL</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700 mb-2">
                  TOIL applies to all employees who are required to work beyond their contracted 
                  hours. To be eligible for TOIL, the additional work must be:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Necessary and unavoidable</li>
                  <li>Approved in advance by your manager when possible</li>
                  <li>Recorded accurately in this system</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Recording Extra Hours</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700">
                  All extra hours worked should be recorded in this system as soon as possible 
                  after working them. Include details of the project, times worked, and reason 
                  for the extra hours. Your manager will review and approve these hours.
                </p>
                
                <div className="flex items-center mt-2 bg-amber-50 p-2 rounded text-sm">
                  <Info className="h-4 w-4 text-amber-500 mr-2 shrink-0" />
                  <span>
                    Time recorded more than 30 days after working may require additional verification.
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Taking TOIL</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700 mb-2">
                  To use your accumulated TOIL balance:
                </p>
                <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                  <li>Submit a request through this system</li>
                  <li>Specify the amount of time you wish to take</li>
                  <li>Wait for manager approval before taking the time off</li>
                </ol>
                
                <div className="flex items-center mt-2 bg-blue-50 p-2 rounded text-sm">
                  <Clock className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                  <span>
                    TOIL should ideally be taken within 3 months of accruing the extra hours.
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Maximum TOIL Accrual</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    Employees are encouraged to use their TOIL within a reasonable timeframe. 
                    The maximum TOIL balance that can be accrued is <span className="font-bold">40 hours</span>.
                  </p>
                  <p>
                    When approaching this limit, you will receive notifications encouraging you 
                    to schedule time off. Your manager may also discuss planning time off to 
                    reduce your TOIL balance.
                  </p>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="mt-3 text-purple-700 underline cursor-help">
                        Why do we have a maximum limit?
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Excessive TOIL accrual can lead to staffing challenges when many hours are 
                        taken at once. The limit also helps ensure employees maintain a healthy 
                        work-life balance by taking earned time off regularly.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
